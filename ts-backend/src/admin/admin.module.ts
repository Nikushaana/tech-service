import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { BranchesModule } from 'src/branches/branches.module';
import { AddressModule } from 'src/address/address.module';
import { OrderModule } from 'src/order/order.module';
import { FaqModule } from 'src/faq/faq.module';
import { CategoryModule } from 'src/category/category.module';
import { IndividualClientModule } from 'src/individual-client/individual-client.module';
import { CompanyClientModule } from 'src/company-client/company-client.module';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { TechnicianModule } from 'src/technician/technician.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), BaseUserModule, TokensModule, CloudinaryModule, NotificationsModule, ReviewsModule, BranchesModule, AddressModule, OrderModule, FaqModule, CategoryModule, IndividualClientModule, CompanyClientModule, DeliveryModule, TechnicianModule, TransactionsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule { }
