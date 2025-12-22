import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyClient } from './entities/company-client.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { CompanyClientController } from './company-client.controller';
import { CompanyClientService } from './company-client.service';
import { TokensModule } from 'src/common/tokens/token.module';
import { Review } from 'src/reviews/entities/review.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([CompanyClient, Review]), BaseUserModule, VerificationCodeModule, TokensModule, NotificationsModule],
    controllers: [CompanyClientController],
    providers: [CompanyClientService],
})
export class CompanyClientModule { }
