import { Module } from '@nestjs/common';
import { GoogleApisService } from './google-apis.service';
import { GoogleApisController } from './google-apis.controller';

@Module({
  providers: [GoogleApisService],
  controllers: [GoogleApisController]
})
export class GoogleApisModule { }
