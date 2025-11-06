import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class DeliveryService {
    constructor(
        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,
    ) { }

    // delivery

    async getDelivery(deliveryId: number) {
        const findDelivery = await this.baseUserService.getUser(deliveryId, this.deliveryRepo);

        return instanceToPlain(findDelivery);
    }

    async updateDelivery(deliveryId: number, updateDeliveryDto: UpdateDeliveryDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(deliveryId, this.deliveryRepo, updateDeliveryDto, images);
    }

    async changePassword(deliveryId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.deliveryRepo, deliveryId, changePasswordDto);
    }

    // send and verify sent code

    async sendChangeNumberCode(phoneDto: PhoneDto) {
        const result = await this.verificationCodeService.sendCode(phoneDto, 'change-number');

        return { message: `Code ${result.code} sent to ${result.phone}`, code: result.code };
    }

    async changeNumber(deliveryId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.deliveryRepo, deliveryId, changeNumberDto);
    }

    // order

    async getOrders(deliveryId: number) {
        const orders = await this.orderRepo.find({
            where: { delivery: { id: deliveryId } },
            order: { created_at: 'DESC' },
            relations: ['individual', 'company', 'technician'],
        });

        return instanceToPlain(orders);
    }

    async getOneOrder(deliveryId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, delivery: { id: deliveryId } },
            relations: ['individual', 'company', 'technician'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return instanceToPlain(order)
    }
}
