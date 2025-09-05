import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { VerificationCodeService } from './verification-code.service';

@Module({
    imports: [TypeOrmModule.forFeature([IndividualClient, CompanyClient, Technician, VerificationCode])],
    providers: [VerificationCodeService],
    exports: [VerificationCodeService],
})
export class VerificationCodeModule { }