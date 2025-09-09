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
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterIndAdmTechnDto } from './dto/register-ind-adm-techn.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

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

    async register(dto: RegisterCompanyDto | RegisterIndAdmTechnDto, role: 'individual' | 'company' | 'technician' | 'admin') {
        const codeEntry = await this.VerificationCodeRepo.findOne({
            where: { phone: dto.phone, verified: true, type: 'register' },
        });
        if (!codeEntry) throw new BadRequestException('Phone not verified');

        const exists =
            (await this.individualClientRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.companyClientRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.technicianRepo.findOne({ where: { phone: dto.phone } })) ||
            (await this.adminRepo.findOne({ where: { phone: dto.phone } }))
            ;

        if (exists) throw new BadRequestException('User already registered');

        const { password, ...rest } = dto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const repo: any =
            role === 'individual'
                ? this.individualClientRepo
                : role === 'admin'
                    ? this.adminRepo
                    : role === 'technician'
                        ? this.technicianRepo
                        : role === 'company'
                            ? this.companyClientRepo
                            : null;

        if (!repo) {
            throw new BadRequestException('Invalid role');
        }

        const user = repo.create({
            ...rest,
            password: hashedPassword,
        });

        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: dto.phone, type: 'register' });

        return {
            message: `${role} registered successfully`,
            user: instanceToPlain(user),
        };
    }

    async login(loginUserDto: LoginUserDto, role: 'individualOrCompany' | 'technician' | 'admin') {
        const userRepoMap: any = {
            individual: this.individualClientRepo,
            company: this.companyClientRepo,
            technician: this.technicianRepo,
            admin: this.adminRepo,
        };

        const tokenRepoMap: any = {
            individual: this.individualClientTokenRepo,
            company: this.companyClientTokenRepo,
            technician: this.technicianTokenRepo,
            admin: this.adminTokenRepo,
        };

        // 1. Determine which repo to use
        let user: any = null;
        let actualRole: 'individual' | 'company' | 'technician' | 'admin' = null as any;

        if (role === 'admin' || role === 'technician') {
            actualRole = role;
            user = await userRepoMap[role].findOne({ where: { phone: loginUserDto.phone } });
        } else if (role === 'individualOrCompany') {
            user = await userRepoMap.individual.findOne({ where: { phone: loginUserDto.phone } });
            if (user) actualRole = 'individual';
            else {
                user = await userRepoMap.company.findOne({ where: { phone: loginUserDto.phone } });
                if (user) actualRole = 'company';
            }
        }

        if (!user || !actualRole) throw new UnauthorizedException('Invalid credentials');

        // 2. Check password
        const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // 3. Generate token
        const payload = { id: user.id, role: actualRole };
        const token = this.signToken(payload);

        // 4. Save or update token dynamically
        const tokenRepo = tokenRepoMap[actualRole];
        const tokenEntityKey = actualRole === 'technician' || actualRole === 'admin'
            ? actualRole
            : `${actualRole}Client`;

        let tokenEntity = await tokenRepo.findOne({
            where: { [tokenEntityKey]: { id: user.id } },
        });

        if (tokenEntity) tokenEntity.token = token;
        else tokenEntity = tokenRepo.create({ [tokenEntityKey]: user, token });

        await tokenRepo.save(tokenEntity);

        return {
            message: `${actualRole} logged in successfully`,
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
