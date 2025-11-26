import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Address } from "src/address/entities/address.entity";
import { Category } from "src/category/entities/category.entity";
import { Order } from "src/order/entities/order.entity";
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
import { CreateOrderDto } from "src/order/dto/create-order.dto";
import { UpdateUserOrderDto } from "src/order/dto/update-user-order.dto";
import { CreateAddressDto } from "src/address/dto/create-address.dto";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { CreateReviewDto } from "src/reviews/dto/create-review.dto";
import { Review } from "src/reviews/entities/review.entity";
import { Branch } from "src/branches/entities/branches.entity";

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

        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,

        @InjectRepository(Review)
        private readonly reviewRepo: Repository<Review>,

        @InjectRepository(Branch)
        private branchRepo: Repository<Branch>,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly cloudinaryService: CloudinaryService,
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

        // Save user-agent

        if (userAgent) {
            const devices = findUser.used_devices || [];

            devices.push(userAgent);
            findUser.used_devices = devices;
            await repo.save(findUser);
        }

        return findUser;
    }

    async updateUser(userId: number, repo: any, updateUserDto: UpdateCompanyDto | UpdateIndividualDto, images: Express.Multer.File[] = []) {
        const user = await this.getUser(userId, repo)

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
            `tech_service_project/images/${user.role == "company" ? "companies" : user.role == "individual" ? "individuals" : "technicians"}`,
        );

        const updatedUser = repo.merge(user, updateUserDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedUser.images = [...(updatedUser.images || []), ...imageUrls];
        }

        await repo.save(updatedUser);

        return {
            message: 'user updated successfully',
            user: instanceToPlain(updatedUser),
        };
    }

    // about orders

    async createOrder(userId: number, repo: any, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.getUser(userId, repo)

        if (!user.status) {
            throw new BadRequestException('Inactive user cannot create orders');
        }

        const category = await this.categoryRepo.findOne({ where: { id: createOrderDto.categoryId, status: true } });
        if (!category) throw new NotFoundException('Category not found');

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({ where: { id: createOrderDto.addressId, [relationKey]: { id: userId } } });
        if (!address) throw new NotFoundException('Address not found');

        const branches = await this.branchRepo.find();
        if (!branches.length) throw new BadRequestException('No branches available — cannot add order');

        // Check if location is within any branch coverage
        const isWithinCoverage = branches.some((branch) => {
            const distance = this.getDistanceFromLatLonInKm(
                address.location.lat,
                address.location.lng,
                branch.location.lat,
                branch.location.lng
            );
            return distance <= Number(branch.coverage_radius_km);
        });

        if (!isWithinCoverage) {
            throw new BadRequestException(
                'Address is outside all branch coverage areas. Please choose a closer location.'
            );
        }

        const order = this.orderRepo.create({
            ...createOrderDto,
            category,
            address
        });

        if ("companyName" in user) {
            order.company = user;
        } else {
            order.individual = user;
        }

        await this.orderRepo.save(order);

        // Upload images to Cloudinary if any
        const imageUrls = images.length
            ? await this.cloudinaryService.uploadImages(images, `tech_service_project/images/orders/${order.id}`)
            : [];

        const videoUrls = videos.length
            ? await this.cloudinaryService.uploadVideos(videos, `tech_service_project/videos/orders/${order.id}`)
            : [];

        order.images = imageUrls;
        order.videos = videoUrls;

        await this.orderRepo.save(order);

        return { message: `Order created successfully`, order: instanceToPlain(order) };
    }

    async getOrders(userId: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const orders = await this.orderRepo.find({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return orders;
    }

    async getOneOrder(userId: number, id: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async updateOneOrder(userId: number, id: number, repo: any, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.getUser(userId, repo)

        if (!user.status) {
            throw new BadRequestException('Inactive user cannot update orders');
        }

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== 'pending') {
            throw new BadRequestException('Only pending orders can be updated');
        }

        if (updateUserOrderDto.categoryId) {
            const category = await this.categoryRepo.findOne({
                where: { id: updateUserOrderDto.categoryId, status: true },
            });
            if (!category) throw new NotFoundException('Category not found');
            order.category = category;
        }

        if (updateUserOrderDto.addressId) {
            const address = await this.addressRepo.findOne({
                where: { id: updateUserOrderDto.addressId, [relationKey]: { id: userId } },
            });
            if (!address) throw new NotFoundException('Address not found');

            const branches = await this.branchRepo.find();
            if (!branches.length) throw new BadRequestException('No branches available — cannot add order');

            // Check if location is within any branch coverage
            const isWithinCoverage = branches.some((branch) => {
                const distance = this.getDistanceFromLatLonInKm(
                    address.location.lat,
                    address.location.lng,
                    branch.location.lat,
                    branch.location.lng
                );
                return distance <= Number(branch.coverage_radius_km);
            });

            if (!isWithinCoverage) {
                throw new BadRequestException(
                    'Address is outside all branch coverage areas. Please choose a closer location.'
                );
            }

            order.address = address;
        }

        // Handle deleted media
        let imagesToDeleteArray: string[] = [];
        let videosToDeleteArray: string[] = [];

        if (updateUserOrderDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateUserOrderDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        if (updateUserOrderDto.videosToDelete) {
            try {
                videosToDeleteArray = JSON.parse(updateUserOrderDto.videosToDelete);
            } catch (err) {
                throw new BadRequestException('videosToDeleteArray must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray and videosToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    order.images = order.images.filter((img) => img !== url);
                }),
            );
        }
        if (videosToDeleteArray.length > 0) {
            await Promise.all(
                videosToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    order.videos = order.videos.filter((img) => img !== url);
                }),
            );
        }

        // Upload images to Cloudinary if any
        const newImageUrls = images.length
            ? await this.cloudinaryService.uploadImages(images, `tech_service_project/images/orders/${order.id}`)
            : [];

        const newVideoUrls = videos.length
            ? await this.cloudinaryService.uploadVideos(videos, `tech_service_project/videos/orders/${order.id}`)
            : [];

        // Merge with existing media but respect total limits
        const existingImages = order.images || [];
        const existingVideos = order.videos || [];

        const totalImages = existingImages.length + newImageUrls.length;
        const totalVideos = existingVideos.length + newVideoUrls.length;

        if (totalImages > 3) {
            throw new BadRequestException('Total number of images cannot exceed 3');
        }

        if (totalVideos > 1) {
            throw new BadRequestException('Total number of videos cannot exceed 1');
        }

        order.images = [...existingImages, ...newImageUrls];
        order.videos = [...existingVideos, ...newVideoUrls];

        const { categoryId, addressId, ...rest } = updateUserOrderDto;
        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        return {
            message: 'Order updated successfully',
            order,
        };
    }

    // Distance between two lat/lng in km
    private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of Earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // about address

    async createAddress(userId: number, repo: any, createAddressDto: CreateAddressDto) {
        const user = await repo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const branches = await this.branchRepo.find();
        if (!branches.length) throw new BadRequestException('No branches available — cannot add address');

        const { location } = createAddressDto;

        // Check if location is within any branch coverage
        const isWithinCoverage = branches.some((branch) => {
            const distance = this.getDistanceFromLatLonInKm(
                location.lat,
                location.lng,
                branch.location.lat,
                branch.location.lng
            );
            return distance <= Number(branch.coverage_radius_km);
        });

        if (!isWithinCoverage) {
            throw new BadRequestException(
                'Address is outside all branch coverage areas. Please choose a closer location.'
            );
        }

        const address = this.addressRepo.create({
            ...createAddressDto
        });

        if ("companyName" in user) {
            address.company = user;
        } else {
            address.individual = user;
        }

        await this.addressRepo.save(address);

        return { message: `Address created successfully`, address: instanceToPlain(address) };
    }

    async getAddresses(userId: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const addresses = await this.addressRepo.find({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return addresses;
    }

    async getOneAddress(userId: number, id: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!address) throw new NotFoundException('Address not found');

        return address
    }

    async deleteOneAddress(userId: number, id: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!address) throw new NotFoundException('Address  not found');

        const usedInOrders = await this.orderRepo.count({
            where: [
                { [relationKey]: { id: userId }, address: { id } },
            ],
        });

        if (usedInOrders > 0) {
            throw new BadRequestException('Address cannot be deleted because it is used in an order');
        }

        await this.addressRepo.delete({
            id,
            [relationKey]: { id: userId },
        });

        return {
            message: 'Address deleted successfully',
            address,
        };
    }

    // about review

    async createReview(userId: number, repo: any, createReviewDto: CreateReviewDto) {
        const user = await repo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const review = this.reviewRepo.create({
            ...createReviewDto
        });

        if ("companyName" in user) {
            review.company = user;
        } else {
            review.individual = user;
        }

        await this.reviewRepo.save(review);

        return { message: `Review created successfully`, review: instanceToPlain(review) };
    }

    async getReviews(userId: number, repo: any) {
        const user = await this.getUser(userId, repo)

        const relationKey = "companyName" in user ? "company" : "individual";

        const reviews = await this.reviewRepo.find({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return reviews;
    }
}