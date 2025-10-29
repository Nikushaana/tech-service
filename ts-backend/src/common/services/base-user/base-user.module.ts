import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserService } from './base-user.service';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { Category } from 'src/category/entities/category.entity';
import { Order } from 'src/order/entities/order.entity';
import { Address } from 'src/address/entities/address.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { CommonModule } from 'src/common/common.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Review } from 'src/reviews/entities/review.entity';
import { Branch } from 'src/branches/entities/branches.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VerificationCode, Category, Order, Address, Review, Branch]), VerificationCodeModule, CommonModule, CloudinaryModule],
    providers: [BaseUserService],
    exports: [BaseUserService],
})
export class BaseUserModule { }