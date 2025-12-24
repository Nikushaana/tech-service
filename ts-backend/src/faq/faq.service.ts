import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { Repository } from 'typeorm';
import { UpdateFaqDto } from './dto/update-category.dto';

@Injectable()
export class FaqService {
    constructor(
        @InjectRepository(Faq)
        private readonly faqRepo: Repository<Faq>,
    ) { }

    // admin
    async createFaq(createFaqDto: CreateFaqDto) {
        const faq = this.faqRepo.create({
            ...createFaqDto,
        });

        await this.faqRepo.save(faq);

        return { message: `Faq created successfully`, faq };
    }

    async getFaqs() {
        const faqs = await this.faqRepo.find({
            order: { order: 'ASC' },
        });

        return faqs;
    }

    async getOneFaq(id: number) {
        const faq = await this.faqRepo.findOne({
            where: { id },
        });
        if (!faq) throw new NotFoundException('Faq not found');

        return faq
    }

    async updateOneFaq(
        id: number,
        updateFaqDto: UpdateFaqDto
    ) {
        const faq = await this.getOneFaq(id)

        // Merge updates
        this.faqRepo.merge(faq, {
            ...updateFaqDto
        });

        await this.faqRepo.save(faq);

        return {
            message: 'Faq updated successfully',
            faq
        };
    }

    async deleteFaq(id: number) {
        const faq = await this.getOneFaq(id)

        // Delete faq
        await this.faqRepo.remove(faq);

        return {
            message: 'Faq deleted successfully',
        };
    }

    //front
    async getActiveFaqs() {
        const faqs = await this.faqRepo.find({
            where: { status: true },
            order: { order: 'ASC' },
        });

        return faqs;
    }
}
