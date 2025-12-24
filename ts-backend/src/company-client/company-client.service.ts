import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyClient } from './entities/company-client.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { ReviewsService } from 'src/reviews/reviews.service';
import { AddressService } from 'src/address/address.service';
import { OrderService } from 'src/order/order.service';
import * as bcrypt from 'bcrypt';
import { UpdateAdminCompanyDto } from 'src/admin/dto/update-admin-company.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CompanyClientService {
    constructor(
        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly reviewsService: ReviewsService,

        private readonly addressService: AddressService,

        private readonly orderService: OrderService,

        private readonly cloudinaryService: CloudinaryService,

        private readonly notificationService: NotificationsService,
    ) { }

    // company
    async getCompanies() {
        const findCompanies = await this.baseUserService.getUsers(this.companyClientRepo);

        return instanceToPlain(findCompanies);
    }

    async getAdminOneCompany(companyId: number) {
        const findOneCompany = await this.baseUserService.getUser(companyId, this.companyClientRepo);

        return instanceToPlain(findOneCompany)
    }

    async updateAdminOneCompany(companyId: number, updateAdminCompanyDto: UpdateAdminCompanyDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(companyId, this.companyClientRepo, updateAdminCompanyDto, images, "admin");
    }

    async getCompany(companyId: number, userAgent?: string) {
        const findCompany = await this.baseUserService.getUser(companyId, this.companyClientRepo, userAgent);

        return instanceToPlain(findCompany);
    }

    async updateCompany(companyId: number, updateCompanyDto: UpdateCompanyDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(companyId, this.companyClientRepo, updateCompanyDto, images);
    }

    async changePassword(companyId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.companyClientRepo, companyId, changePasswordDto);
    }

    // send and verify sent code
    async sendChangeNumberCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'change-number');
    }

    async changeNumber(companyId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.companyClientRepo, companyId, changeNumberDto);
    }

    // create order
    async createOrder(companyId: number, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.createOrder(companyId, this.companyClientRepo, createOrderDto, images, videos);
    }

    async getOrders(companyId: number) {
        return this.orderService.getOrders(companyId, this.companyClientRepo);
    }

    async getOneOrder(companyId: number, id: number) {
        return this.orderService.getOneOrder(companyId, id, this.companyClientRepo);
    }

    async updateOneOrder(companyId: number, id: number, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.orderService.updateOneOrder(companyId, id, this.companyClientRepo, updateUserOrderDto, images, videos);
    }

    // create address
    async createAddress(companyId: number, createAddressDto: CreateAddressDto) {
        return this.addressService.createAddress(companyId, this.companyClientRepo, createAddressDto);
    }

    async getAddresses(companyId: number) {
        return this.addressService.getAddresses(companyId, this.companyClientRepo);
    }

    async getOneAddress(companyId: number, id: number) {
        return this.addressService.getOneAddress(companyId, id, this.companyClientRepo);
    }

    async deleteOneAddress(companyId: number, id: number) {
        return this.addressService.deleteOneAddress(companyId, id, this.companyClientRepo);
    }

    // create review
    async createReview(companyId: number, createReviewDto: CreateReviewDto) {
        return this.reviewsService.createReview(companyId, this.companyClientRepo, createReviewDto);
    }

    async getReviews(companyId: number) {
        return this.reviewsService.getReviews(companyId, this.companyClientRepo);
    }
}
