import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserService } from './base-user.service';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Admin } from 'src/admin/entities/admin.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VerificationCode, IndividualClient, CompanyClient, Technician, Delivery, Admin]), VerificationCodeModule, CloudinaryModule],
    providers: [BaseUserService],
    exports: [BaseUserService],
})
export class BaseUserModule { }