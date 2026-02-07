import { Controller, Get, Query } from '@nestjs/common';
import { BranchesService } from 'src/branches/branches.service';
import { FaqService } from 'src/faq/faq.service';
import { CategoryService } from 'src/category/category.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { GetCitiesDto } from 'src/cities/dto/get-cities.dto';
import { CitiesService } from 'src/cities/cities.service';
import { StreetsService } from 'src/streets/streets.service';
import { GetStreetsDto } from 'src/streets/dto/get-streets.dto';

@Controller('front')
export class FrontController {
    constructor(
        private readonly branchesService: BranchesService,

        private readonly faqService: FaqService,

        private readonly categoryService: CategoryService,

        private readonly reviewsService: ReviewsService,

        private readonly citiesService: CitiesService,

        private readonly streetsService: StreetsService,
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
    async getFrontBranches() {
        return this.branchesService.getFrontBranches();
    }

    @Get('cities')
    async getCities(@Query() query: GetCitiesDto) {
        return this.citiesService.getCities(query.city);
    }

    @Get('streets')
    async getStreets(@Query() query: GetStreetsDto) {
        return this.streetsService.getStreets(query.city, query.street);
    }
}
