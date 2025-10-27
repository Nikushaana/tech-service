import { Module } from '@nestjs/common';
import { FrontService } from './front.service';
import { FrontController } from './front.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Faq } from 'src/faq/entities/faq.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { Review } from 'src/reviews/entities/review.entity';
import { Branch } from 'src/branches/entities/branches.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Technician, Faq, Review, Branch]), BaseUserModule],
  providers: [FrontService],
  controllers: [FrontController]
})
export class FrontModule {}
