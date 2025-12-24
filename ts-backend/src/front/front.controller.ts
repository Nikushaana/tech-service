import { Controller, Get, Query } from '@nestjs/common';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { BranchesService } from 'src/branches/branches.service';
import { FaqService } from 'src/faq/faq.service';
import { CategoryService } from 'src/category/category.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { TechnicianService } from 'src/technician/technician.service';

@Controller('front')
export class FrontController {
    constructor(
        private readonly branchesService: BranchesService,

        private readonly faqService: FaqService,

        private readonly categoryService: CategoryService,

        private readonly reviewsService: ReviewsService,

        private readonly technicianService: TechnicianService,
    ) { }

    @Get('categories')
    async getCategories(@Query('page') page: number = 1,
        @Query('limit') limit?: string,) {
        return this.categoryService.getActiveCategories(page, limit !== undefined ? Number(limit) : undefined);
    }

    @Get('faqs')
    async getActiveFaqs() {
        return this.faqService.getActiveFaqs();
    }

    @Get('reviews')
    async getReviews() {
        return this.reviewsService.getActiveReviews();
    }

    @Get('branches')
    async getBranches() {
        return this.branchesService.getBranches();
    }
}
