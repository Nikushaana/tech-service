import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestInfo } from 'src/common/types/request-info';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { OrderService } from 'src/order/order.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Controller('technician')
export class TechnicianController {
    constructor(
        private readonly technicianService: TechnicianService,

        private readonly orderService: OrderService,

        private readonly notificationsService: NotificationsService
    ) { }

    // technician
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('')
    async getTechnician(@Req() req: RequestInfo) {
        return this.technicianService.getTechnician(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateTechnician(@Req() req: RequestInfo, @Body() updateTechnicianDto: UpdateTechnicianDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.technicianService.updateTechnician(req.user.id, updateTechnicianDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.technicianService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.technicianService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.technicianService.changeNumber(req.user.id, changeNumberDto);
    }

    // order
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('orders')
    async getTechnicianOrders(@Req() req: RequestInfo) {
        return this.orderService.getTechnicianOrders(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('orders/:id')
    async getTechnicianOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.getTechnicianOneOrder(req.user.id, id);
    }

    // notifications
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('notifications')
    async getNotifications(@Req() req: RequestInfo) {
        return this.notificationsService.getNotifications("technician", req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.readNotification("technician", id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('notifications/unread')
    async getUnreadNotificationsCount(@Req() req: RequestInfo) {
        return this.notificationsService.getUnreadNotificationsCount("technician", req.user.id);
    }
}
