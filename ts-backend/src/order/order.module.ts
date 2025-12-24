import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { BranchesModule } from 'src/branches/branches.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Address } from 'src/address/entities/address.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Technician, Delivery, Address, Category]), BaseUserModule, BranchesModule, CloudinaryModule, NotificationsModule],
    providers: [OrderService],
    exports: [OrderService, TypeOrmModule],
})
export class OrderModule { }