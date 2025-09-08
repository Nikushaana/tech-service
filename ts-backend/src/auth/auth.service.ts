import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { AdminToken } from 'src/admin-token/entities/admin-token.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { IndividualClientToken } from 'src/individual-client-token/entities/individual-client-token.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { CompanyClientToken } from 'src/company-client-token/entities/company-client-token.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { TechnicianToken } from 'src/technician-token/entities/technician-token.entity';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { PhoneDto, ResetPasswordDto, VerifyCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,

        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        @InjectRepository(AdminToken)
        private adminTokenRepo: Repository<AdminToken>,

        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        @InjectRepository(IndividualClientToken)
        private individualClientTokenRepo: Repository<IndividualClientToken>,

        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        @InjectRepository(CompanyClientToken)
        private companyClientTokenRepo: Repository<CompanyClientToken>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(TechnicianToken)
        private technicianTokenRepo: Repository<TechnicianToken>,

        @InjectRepository(VerificationCode)
        private VerificationCodeRepo: Repository<VerificationCode>,

        private readonly verificationCodeService: VerificationCodeService
    ) { }

    signToken(payload: any): string {
        return this.jwtService.sign(payload);
    }

    // send and verify sent code

    async sendRegisterCode(phoneDto: PhoneDto) {
        const result = await this.verificationCodeService.sendCode(phoneDto, 'register');

        return { message: `Code ${result.code} sent to ${result.phone}`, code: result.code };
    }

    async verifyRegisterCode(verifyCodeDto: VerifyCodeDto) {
        return this.verificationCodeService.verifyCode(verifyCodeDto, 'register');
    }

    // users

    async register(registerDto: RegisterDto) {
        const { role } = registerDto;

        const codeEntry = await this.VerificationCodeRepo.findOne({
            where: { phone: registerDto.phone, verified: true, type: 'register' },
        });
        if (!codeEntry) throw new BadRequestException('Phone not verified');

        const exists =
            (await this.individualClientRepo.findOne({ where: { phone: registerDto.phone } })) ||
            (await this.companyClientRepo.findOne({ where: { phone: registerDto.phone } })) ||
            (await this.technicianRepo.findOne({ where: { phone: registerDto.phone } })) ||
            (await this.adminRepo.findOne({ where: { phone: registerDto.phone } }))
            ;

        if (exists) throw new BadRequestException('User already registered');

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        let repo: Repository<any> | null = null;
        let userData: any = null;

        if (role === 'individual' || role === 'technician' || role === 'admin') {
            repo = role === 'individual' ? this.individualClientRepo : role === 'admin' ? this.adminRepo : role === 'technician' ? this.technicianRepo : null;
            userData = {
                phone: registerDto.phone,
                name: registerDto.name,
                lastName: registerDto.lastName,
                password: hashedPassword,
            };
        } else if (role === 'company') {
            repo = this.companyClientRepo;
            userData = {
                phone: registerDto.phone,
                companyAgentName: registerDto.companyAgentName,
                companyAgentLastName: registerDto.companyAgentLastName,
                companyName: registerDto.companyName,
                companyIdentificationCode: registerDto.companyIdentificationCode,
                password: hashedPassword,
            };
        }

        if (!repo || !userData) {
            throw new BadRequestException('Invalid role');
        }

        const user = repo.create(userData);
        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: registerDto.phone, type: 'register' });

        return {
            message: `${role} registered successfully`,
            user: instanceToPlain(user),
        };
    }

    async login(loginUserDto: LoginUserDto) {
        // Find the user dynamically
        let user: IndividualClient | CompanyClient | Technician | Admin | null = null;
        let role: 'individual' | 'company' | 'technician' | 'admin' | null = null;

        user = await this.individualClientRepo.findOne({ where: { phone: loginUserDto.phone } });
        if (user) role = 'individual';
        else {
            user = await this.companyClientRepo.findOne({ where: { phone: loginUserDto.phone } });
            if (user) role = 'company';
            else {
                user = await this.technicianRepo.findOne({ where: { phone: loginUserDto.phone } });
                if (user) role = 'technician';
                else {
                    user = await this.adminRepo.findOne({ where: { phone: loginUserDto.phone } });
                    if (user) role = 'admin';
                }
            }
        }

        if (!user || !role) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const payload = { id: user.id, role };
        const token = this.signToken(payload);

        // Save or update token with type narrowing
        if (role === 'individual') {
            let clientToken = await this.individualClientTokenRepo.findOne({
                where: { individualClient: { id: user.id } },
            });
            if (clientToken) clientToken.token = token;
            else clientToken = this.individualClientTokenRepo.create({ individualClient: user as IndividualClient, token });
            await this.individualClientTokenRepo.save(clientToken);
        } else if (role === 'company') {
            let clientToken = await this.companyClientTokenRepo.findOne({
                where: { companyClient: { id: user.id } },
            });
            if (clientToken) clientToken.token = token;
            else clientToken = this.companyClientTokenRepo.create({ companyClient: user as CompanyClient, token });
            await this.companyClientTokenRepo.save(clientToken);
        } else if (role === 'technician') {
            let technicianToken = await this.technicianTokenRepo.findOne({
                where: { technician: { id: user.id } },
            });
            if (technicianToken) technicianToken.token = token;
            else technicianToken = this.technicianTokenRepo.create({ technician: user as Technician, token });
            await this.technicianTokenRepo.save(technicianToken);
        } else if (role === 'admin') {
            let adminToken = await this.adminTokenRepo.findOne({
                where: { admin: { id: user.id } },
            });
            if (adminToken) adminToken.token = token;
            else adminToken = this.adminTokenRepo.create({ admin: user as Admin, token });
            await this.adminTokenRepo.save(adminToken);
        }

        return {
            message: `${role} logged in successfully`,
            token,
            user: instanceToPlain(user),
        };
    }

    async logout(authHeader: string, role: 'individual' | 'company' | 'technician' | 'admin') {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        const result =
            role === 'individual'
                ? await this.individualClientTokenRepo.delete({ token })
                : role === 'company' ? await this.companyClientTokenRepo.delete({ token })
                    : role === 'technician' ? await this.technicianTokenRepo.delete({ token })
                        : await this.adminTokenRepo.delete({ token });

        if (result.affected === 0) {
            throw new NotFoundException('Token not found in database');
        }

        return { message: `${role} logged out successfully` };
    }

    async sendResetPasswordCode(phoneDto: PhoneDto) {
        const result = await this.verificationCodeService.sendCode(phoneDto, 'reset-password');
        return { message: `Code ${result.code} sent to ${result.phone}`, code: result.code };
    }

    async resetPassword(
        resetPasswordDto: ResetPasswordDto
    ) {
        await this.verificationCodeService.verifyCode(
            { phone: resetPasswordDto.phone, code: resetPasswordDto.code },
            'reset-password',
        );

        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

        const individual = await this.individualClientRepo.findOne({ where: { phone: resetPasswordDto.phone } });
        const company = await this.companyClientRepo.findOne({ where: { phone: resetPasswordDto.phone } });
        const technician = await this.technicianRepo.findOne({ where: { phone: resetPasswordDto.phone } });

        let user;
        let repo;
        let role: 'individual' | 'company' | 'technician';

        if (individual) {
            user = individual;
            repo = this.individualClientRepo;
            role = 'individual';
        } else if (company) {
            user = company;
            repo = this.companyClientRepo;
            role = 'company';
        } else if (technician) {
            user = technician;
            repo = this.technicianRepo;
            role = 'technician';
        } else {
            throw new BadRequestException('User not found');
        }

        user.password = hashedPassword;
        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: resetPasswordDto.phone, type: 'reset-password' });

        return {
            message: `${role} password reset successfully`,
            user: instanceToPlain(user),
        };
    }
}
