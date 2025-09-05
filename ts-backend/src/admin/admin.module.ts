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

@Module({
  imports: [TypeOrmModule.forFeature([Admin, IndividualClient, CompanyClient, Technician, Order, Category, Faq, Address]), BaseUserModule, TokensModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule { }
