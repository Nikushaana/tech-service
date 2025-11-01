import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CompanyClientController } from './company-client/company-client.controller';
import { CompanyClientService } from './company-client/company-client.service';
import { CompanyClientModule } from './company-client/company-client.module';
import { FrontModule } from './front/front.module';
import { IndividualClientModule } from './individual-client/individual-client.module';
import { TechnicianModule } from './technician/technician.module';
import { GoogleApisModule } from './google-apis/google-apis.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
          return {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            ssl: {
              rejectUnauthorized: false,
            },
            autoLoadEntities: true,
            synchronize: true,
          };
        } else {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }
      },
    }),

    AdminModule,

    AuthModule,

    IndividualClientModule,

    CompanyClientModule,

    FrontModule,

    TechnicianModule,

    GoogleApisModule,

    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
