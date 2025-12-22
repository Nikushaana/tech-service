import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { IndividualClientService } from './individual-client.service';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestInfo } from 'src/common/types/request-info';
import { UpdateIndividualDto } from './dto/update-individual.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { MultipleFilesUpload } from 'src/common/interceptors/MultipleFilesUpload.interceptor';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Controller('individual')
export class IndividualClientController {
    constructor(
        private readonly individualClientService: IndividualClientService,

        private readonly notificationsService: NotificationsService
    ) { }

    // individual

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('')
    async getIndividual(@Req() req: RequestInfo) {
        const userAgent = req.headers['user-agent'] || 'Not Found';

        return this.individualClientService.getIndividual(req.user.id, userAgent);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateIndividual(@Req() req: RequestInfo, @Body() updateIndividualDto: UpdateIndividualDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.individualClientService.updateIndividual(req.user.id, updateIndividualDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.individualClientService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.individualClientService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.individualClientService.changeNumber(req.user.id, changeNumberDto);
    }

    // order

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
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
        return this.individualClientService.createOrder(req.user.id, createOrderDto, images, videos);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('orders')
    async getOrders(@Req() req: RequestInfo) {
        return this.individualClientService.getOrders(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('orders/:id')
    async getOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.individualClientService.getOneOrder(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Patch('orders/:id')
    async updateOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number, @Body() updateUserOrderDto: UpdateUserOrderDto) {
        return this.individualClientService.updateOneOrder(req.user.id, id, updateUserOrderDto);
    }

    // address

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Post('create-address')
    async createAddress(@Req() req: RequestInfo, @Body() createAddressDto: CreateAddressDto) {
        return this.individualClientService.createAddress(req.user.id, createAddressDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('addresses')
    async getAddresses(@Req() req: RequestInfo) {
        return this.individualClientService.getAddresses(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('addresses/:id')
    async getOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.individualClientService.getOneAddress(req.user.id, id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Delete('addresses/:id')
    async deleteOneAddress(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.individualClientService.deleteOneAddress(req.user.id, id);
    }

    // review

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Post('create-review')
    async createReview(@Req() req: RequestInfo, @Body() createReviewDto: CreateReviewDto) {
        return this.individualClientService.createReview(req.user.id, createReviewDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('reviews')
    async getReviews(@Req() req: RequestInfo) {
        return this.individualClientService.getReviews(req.user.id);
    }

    // notifications

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Get('notifications')
    async getNotifications(@Req() req: RequestInfo) {
        return this.individualClientService.getNotifications(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Delete('notifications/:id')
    async deleteNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.deleteNotification(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification(id);
    }
}
