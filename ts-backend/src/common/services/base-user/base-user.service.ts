import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VerificationCode } from "src/verification-code/entities/verification-code.entity";
import { VerificationCodeService } from "src/verification-code/verification-code.service";
import { Repository } from "typeorm";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ChangeNumberDto } from "src/verification-code/dto/verification-code.dto";
import { instanceToPlain } from "class-transformer";
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from "./dto/user-filter.dto";
import { UpdateCompanyDto } from "src/company-client/dto/update-company.dto";
import { UpdateIndividualDto } from "src/individual-client/dto/update-individual.dto";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { IndividualClient } from "src/individual-client/entities/individual-client.entity";
import { CompanyClient } from "src/company-client/entities/company-client.entity";
import { Technician } from "src/technician/entities/technician.entity";
import { Delivery } from "src/delivery/entities/delivery.entity";
import { Admin } from "src/admin/entities/admin.entity";
import { UpdateAdminIndividualTechnicianDeliveryDto } from "src/admin/dto/update-adm-ind-tech-del.dto";
import { NotificationsService } from "src/notifications/notifications.service";

interface WithIdAndPassword {
    id: number;
    password: string;
}

interface WithIdAndPhone {
    id: number;
    phone: string;
}

@Injectable()
export class BaseUserService {
    constructor(
        @InjectRepository(VerificationCode)
        private VerificationCodeRepo: Repository<VerificationCode>,

        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly cloudinaryService: CloudinaryService,

        private readonly notificationService: NotificationsService,
    ) { }

    async changePassword<T extends WithIdAndPassword>(
        repo: Repository<T>,
        userId: number,
        changePasswordDto: ChangePasswordDto
    ) {
        const user = await repo.findOneBy({ id: userId } as any);
        if (!user) throw new BadRequestException('User not found');

        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
        if (!isMatch) throw new BadRequestException('Old password is incorrect');

        user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await repo.save(user);

        return { message: 'Password updated successfully' };
    }

    async changeNumber<T extends WithIdAndPhone>(
        repo: Repository<T>,
        userId: number,
        changeNumberDto: ChangeNumberDto,
    ) {
        await this.verificationCodeService.verifyCode({ phone: changeNumberDto.phone, code: changeNumberDto.code }, 'change-number');

        const user = await repo.findOneBy({ id: userId } as any);
        if (!user) throw new BadRequestException('User not found');

        user.phone = changeNumberDto.phone;
        await repo.save(user);

        await this.VerificationCodeRepo.delete({ phone: changeNumberDto.phone, type: 'change-number' });

        return {
            message: `user phone number changed successfully`,
            user: instanceToPlain(user),
        };
    }

    // check phone exists or not
    async checkPhoneExists(phone: string, excludeUserId?: number) {
        const userExists =
            (await this.individualClientRepo.findOne({ where: { phone } })) ||
            (await this.companyClientRepo.findOne({ where: { phone } })) ||
            (await this.technicianRepo.findOne({ where: { phone } })) ||
            (await this.deliveryRepo.findOne({ where: { phone } })) ||
            (await this.adminRepo.findOne({ where: { phone } }))
            ;

        if (userExists && userExists.id !== excludeUserId) {
            throw new ConflictException('Phone is already in use');
        }

        return false;
    }

    // registered user services
    async getUsers(repo: any, userFilterDto?: UserFilterDto) {
        const findUsers = await repo.find({
            where: userFilterDto,
            order: { created_at: 'DESC' },
        });

        return findUsers;
    }

    async getUser(userId: number, repo: any, userAgent?: string) {
        const findUser = await repo.findOne({
            where: { id: userId },
        });

        if (!findUser) throw new NotFoundException('User not found');

        // Save user_agent
        if (userAgent) {
            const mobileRegex = /Android|iPhone|iPad|iPod|Mobile/i;
            const type: 'mobile' | 'desktop' = mobileRegex.test(userAgent) ? 'mobile' : 'desktop';

            if (!findUser.used_devices) {
                findUser.used_devices = { mobile: 0, desktop: 0 };
            }

            findUser.used_devices[type] += 1;

            await repo.save(findUser);
        }

        return findUser;
    }

    async updateUser(userId: number, repo: any, updateUserDto: UpdateAdminIndividualTechnicianDeliveryDto | UpdateCompanyDto | UpdateIndividualDto, images: Express.Multer.File[] = [], role?: string) {
        const user = await this.getUser(userId, repo);

        if (role == "admin") {
            if ('phone' in updateUserDto && updateUserDto.phone && updateUserDto.phone !== user.phone) {
                await this.checkPhoneExists(updateUserDto.phone, userId);
            }

            if ('password' in updateUserDto && updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }
        }

        let imagesToDeleteArray: string[] = [];
        if (updateUserDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateUserDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    user.images = user.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = user.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            `tech_service_project/images/${user.role == "company" ? "companies" : user.role == "individual" ? "individuals" : user.role == "technician" ? "technicians" : "deliveries"}`,
        );

        const oldStatus = user.status;

        const updatedUser = repo.merge(user, updateUserDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedUser.images = [...(updatedUser.images || []), ...imageUrls];
        }

        await repo.save(updatedUser);

        if ('status' in updateUserDto && oldStatus !== updateUserDto.status) {
            // send notification to admin
            const roleInGeo =
                user.role === 'individual'
                    ? "ფიზიკური პირი"
                    : user.role === 'admin'
                        ? "ადმინი"
                        : user.role === 'technician'
                            ? "ტექნიკოსი"
                            : user.role === 'delivery'
                                ? "კურიერი"
                                : user.role === 'company'
                                    ? "იურიდიული პირი"
                                    : "მომხმარებელი";

            await this.notificationService.sendNotification(
                `${updateUserDto.status ? "გააქტიურდა" : "დაიბლოკა"} ${roleInGeo + " " + (user.companyName || (user.name + " " + user.lastName))}-ს პროფილი.`,
                'profile_updated',
                'admin',
                undefined,
                {
                    user_id: user.id,
                    user_role: user.role,
                },
            );

            // send notification to user if status changes
            await this.notificationService.sendNotification(
                `${updateUserDto.status ? "თქვენი პროფილი გააქტიურებულია" : "თქვენი პროფილი დაიბლოკა"}.`,
                "profile_updated",
                user.role,
                userId,
            );
        }

        return {
            message: 'User updated successfully',
            user: instanceToPlain(updatedUser),
        };
    }

    // statistics
    async getUserRegistrationStats() {
        const individuals = await this.getUsers(this.individualClientRepo);
        const companies = await this.getUsers(this.companyClientRepo);

        const groupByMonth = (users: { created_at: Date }[]) =>
            users.reduce((acc, user) => {
                const date = new Date(user.created_at);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
                acc[yearMonth] = (acc[yearMonth] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const individualsByMonth = groupByMonth(individuals);
        const companiesByMonth = groupByMonth(companies);

        const allMonths = Array.from(new Set([...Object.keys(individualsByMonth), ...Object.keys(companiesByMonth)])).sort();

        const stats = allMonths.map((month) => ({
            date: month,
            individuals: individualsByMonth[month] || 0,
            companies: companiesByMonth[month] || 0,
        }));

        const individualsLength = individuals.length;
        const companiesLength = companies.length;

        return { stats, individualsLength, companiesLength };
    }

    async getUsedDevicesStats() {
        const individuals = await this.getUsers(this.individualClientRepo);
        const companies = await this.getUsers(this.companyClientRepo);

        const allUsers = [...individuals, ...companies];

        const stats = { mobile: 0, desktop: 0 };

        allUsers.forEach(user => {
            if (user.used_devices) {
                stats.mobile += user.used_devices.mobile || 0;
                stats.desktop += user.used_devices.desktop || 0;
            }
        });

        return stats;
    }
}