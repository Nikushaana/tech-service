import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Order]),
    BaseUserModule, VerificationCodeModule, TokensModule
  ],
  providers: [DeliveryService],
  controllers: [DeliveryController]
})
export class DeliveryModule { }
