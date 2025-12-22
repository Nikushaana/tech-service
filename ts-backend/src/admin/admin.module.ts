import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Order } from 'src/order/entities/order.entity';
import { Category } from 'src/category/entities/category.entity';
import { Faq } from 'src/faq/entities/faq.entity';
import { Address } from 'src/address/entities/address.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { CommonModule } from 'src/common/common.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Review } from 'src/reviews/entities/review.entity';
import { Branch } from 'src/branches/entities/branches.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, IndividualClient, CompanyClient, Technician, Delivery, Order, Category, Faq, Address, Review, Branch, Notification]), BaseUserModule, TokensModule, CommonModule, CloudinaryModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule { }
