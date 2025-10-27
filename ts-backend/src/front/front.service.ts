import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { Faq } from 'src/faq/entities/faq.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FrontService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(Faq)
        private faqRepo: Repository<Faq>,

        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,

        private readonly baseUserService: BaseUserService,
    ) { }

    async getCategories(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [categories, total] = await this.categoryRepo.findAndCount({
            where: { status: true },
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getFaqs() {
        const faqs = await this.faqRepo.find({
            where: { status: true },
            order: { order: 'ASC' },
        });

        return faqs;
    }

    // front filters all active technicians

    async getTechnicians(userFilterDto: UserFilterDto) {
        const findTechnicians = await this.baseUserService.getUsers(this.technicianRepo, userFilterDto);

        return instanceToPlain(findTechnicians, { groups: ['front'] });
    }

    async getReviews() {
        const reviews = await this.reviewRepo.find({
            where: { status: true },
            order: { created_at: 'DESC' },
            relations: ['company', 'individual'],
        });

        return instanceToPlain(reviews);
    }
}
