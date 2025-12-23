import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyClientService } from './company-client.service';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestInfo } from 'src/common/types/request-info';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { MultipleFilesUpload } from 'src/common/interceptors/MultipleFilesUpload.interceptor';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Controller('company')
export class CompanyClientController {
    constructor(
        private readonly companyClientService: CompanyClientService,
        private readonly notificationsService: NotificationsService
    ) { }

    // company

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('')
    async getIndividual(@Req() req: RequestInfo) {
        const userAgent = req.headers['user-agent'] || 'Not Found';

        return this.companyClientService.getCompany(req.user.id, userAgent);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateCompany(@Req() req: RequestInfo, @Body() updateCompanyDto: UpdateCompanyDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.companyClientService.updateCompany(req.user.id, updateCompanyDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.companyClientService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.companyClientService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.companyClientService.changeNumber(req.user.id, changeNumberDto);
    }

    // order

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-order')
    @UseInterceptors(
        MultipleFilesUpload([
            { name: 'images', maxCount: 3, type: 'image' },
            { name: 'videos', maxCount: 1, type: 'video' },
        ]),
    )
    async createOrder(@Req() req: RequestInfo, @Body() createOrderDto: CreateOrderDto, @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }) {
        const images = files.images || [];
        const videos = files.videos || [];
        return this.companyClientService.createOrder(req.user.id, createOrderDto, images, videos);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('orders')
    async getOrders(@Req() req: RequestInfo) {
        return this.companyClientService.getOrders(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('orders/:id')
    async getOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.getOneOrder(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('orders/:id')
    @UseInterceptors(
        MultipleFilesUpload([
            { name: 'images', maxCount: 3, type: 'image' },
            { name: 'videos', maxCount: 1, type: 'video' },
        ]),
    )
    async updateOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number, @Body() updateUserOrderDto: UpdateUserOrderDto, @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }) {
        const images = files.images || [];
        const videos = files.videos || [];
        return this.companyClientService.updateOneOrder(req.user.id, id, updateUserOrderDto, images, videos);
    }

    // address

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-address')
    async createAddress(@Req() req: RequestInfo, @Body() createAddressDto: CreateAddressDto) {
        return this.companyClientService.createAddress(req.user.id, createAddressDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('addresses')
    async getAddresses(@Req() req: RequestInfo) {
        return this.companyClientService.getAddresses(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('addresses/:id')
    async getOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.getOneAddress(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Delete('addresses/:id')
    async deleteOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.companyClientService.deleteOneAddress(req.user.id, id);
    }

    // review

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Post('create-review')
    async createReview(@Req() req: RequestInfo, @Body() createReviewDto: CreateReviewDto) {
        return this.companyClientService.createReview(req.user.id, createReviewDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('reviews')
    async getReviews(@Req() req: RequestInfo) {
        return this.companyClientService.getReviews(req.user.id);
    }

    // notifications

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('notifications')
    async getNotifications(@Req() req: RequestInfo) {
        return this.notificationsService.getNotifications("company", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Get('notifications/unread')
    async getUnreadNotificationsCount(@Req() req: RequestInfo) {
        return this.notificationsService.getUnreadNotificationsCount("company", req.user.id);
    }
}
