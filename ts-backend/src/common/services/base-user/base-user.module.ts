import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserService } from './base-user.service';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { Category } from 'src/category/entities/category.entity';
import { Order } from 'src/order/entities/order.entity';
import { Address } from 'src/address/entities/address.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';

@Module({
    imports: [TypeOrmModule.forFeature([VerificationCode, Category, Order, Address]), VerificationCodeModule],
    providers: [BaseUserService],
    exports: [BaseUserService],
})
export class BaseUserModule { }