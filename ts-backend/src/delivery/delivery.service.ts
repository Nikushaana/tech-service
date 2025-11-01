import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { instanceToPlain } from 'class-transformer';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';

@Injectable()
export class DeliveryService {
    constructor(
        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

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
}
