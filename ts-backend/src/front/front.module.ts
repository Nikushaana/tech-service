import { Module } from '@nestjs/common';
import { FrontController } from './front.controller';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { BranchesModule } from 'src/branches/branches.module';
import { FaqModule } from 'src/faq/faq.module';
import { CategoryModule } from 'src/category/category.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { TechnicianModule } from 'src/technician/technician.module';

@Module({
  imports: [BaseUserModule, BranchesModule, FaqModule, CategoryModule, ReviewsModule, TechnicianModule],
  controllers: [FrontController]
})
export class FrontModule { }
