import { Controller, Get, Query } from '@nestjs/common';
import { FrontService } from './front.service';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';

@Controller('front')
export class FrontController {
    constructor(private readonly frontService: FrontService) { }

    @Get('categories')
    async getCategories(@Query('page') page: number = 1,
        @Query('limit') limit: number = 10,) {
        return this.frontService.getCategories(page, limit);
    }

    @Get('faqs')
    async getFaqs() {
        return this.frontService.getFaqs();
    }

    @Get('technicians')
    async getTechnicians(@Query() userFilterDto: UserFilterDto) {
        return this.frontService.getTechnicians(userFilterDto);
    }
    
    @Get('reviews')
    async getReviews() {
        return this.frontService.getReviews();
    }
}
