import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { RequestInfo } from 'src/common/types/request-info';

@Controller('delivery')
export class DeliveryController {
    constructor(
        private readonly deliveryService: DeliveryService,
    ) { }

    // delivery

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('')
    async getTechnician(@Req() req: RequestInfo) {
        return this.deliveryService.getDelivery(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateTechnician(@Req() req: RequestInfo, @Body() updateTechnicianDto: UpdateDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.deliveryService.updateDelivery(req.user.id, updateTechnicianDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.deliveryService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.deliveryService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.deliveryService.changeNumber(req.user.id, changeNumberDto);
    }

    // order

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('orders')
    async getOrders(@Req() req: RequestInfo) {
        return this.deliveryService.getOrders(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Get('orders/:id')
    async getOneOrder(@Req() req: RequestInfo, @Param('id', ParseIntPipe) id: number) {
        return this.deliveryService.getOneOrder(req.user.id, id);
    }
}
