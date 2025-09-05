import { Module } from '@nestjs/common';
import { IndividualClientController } from './individual-client.controller';
import { IndividualClientService } from './individual-client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualClient } from './entities/individual-client.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { TokensModule } from 'src/common/tokens/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndividualClient]),
    BaseUserModule, VerificationCodeModule, TokensModule
  ],
  controllers: [IndividualClientController],
  providers: [IndividualClientService]
})
export class IndividualClientModule { }
