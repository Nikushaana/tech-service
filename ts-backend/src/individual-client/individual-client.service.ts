import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualClient } from './entities/individual-client.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateIndividualDto } from './dto/update-individual.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { UpdateUserOrderDto } from 'src/order/dto/update-user-order.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

@Injectable()
export class IndividualClientService {
    constructor(
        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,
    ) { }

    // individual

    async getIndividual(individualId: number) {
        const findIndividual = await this.baseUserService.getUser(individualId, this.individualClientRepo);

        return instanceToPlain(findIndividual);
    }

    async updateIndividual(individualId: number, updateIndividualDto: UpdateIndividualDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(individualId, this.individualClientRepo, updateIndividualDto, images);
    }

    async changePassword(individualId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.individualClientRepo, individualId, changePasswordDto);
    }

    // send and verify sent code

    async sendChangeNumberCode(phoneDto: PhoneDto) {
        const result = await this.verificationCodeService.sendCode(phoneDto, 'change-number');

        return { message: `Code ${result.code} sent to ${result.phone}`, code: result.code };
    }

    async changeNumber(individualId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.individualClientRepo, individualId, changeNumberDto);
    }

    // create order

    async createOrder(individualId: number, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        return this.baseUserService.createOrder(individualId, this.individualClientRepo, createOrderDto, images, videos);
    }

    async getOrders(individualId: number) {
        return this.baseUserService.getOrders(individualId, this.individualClientRepo);
    }

    async getOneOrder(individualId: number, id: number) {
        return this.baseUserService.getOneOrder(individualId, id, this.individualClientRepo);
    }

    async updateOneOrder(individualId: number, id: number, updateUserOrderDto: UpdateUserOrderDto) {
        return this.baseUserService.updateOneOrder(individualId, id, this.individualClientRepo, updateUserOrderDto);
    }

    // create address

    async createAddress(individualId: number, createAddressDto: CreateAddressDto) {
        return this.baseUserService.createAddress(individualId, this.individualClientRepo, createAddressDto);
    }

    async getAddresses(individualId: number) {
        return this.baseUserService.getAddresses(individualId, this.individualClientRepo);
    }

    async getOneAddress(individualId: number, id: number) {
        return this.baseUserService.getOneAddress(individualId, id, this.individualClientRepo);
    }

    async deleteOneAddress(individualId: number, id: number) {
        return this.baseUserService.deleteOneAddress(individualId, id, this.individualClientRepo);
    }
}
