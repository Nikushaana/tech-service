import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // admin
    async createCategory(createCategoryDto: CreateCategoryDto) {
        const existing = await this.categoryRepo.findOne({ where: { name: createCategoryDto.name } });
        if (existing) throw new BadRequestException('Category already exists');

        const category = this.categoryRepo.create({
            ...createCategoryDto
        });

        await this.categoryRepo.save(category);

        return { message: 'Category created successfully', category };
    }

    async getCategories() {
        const categories = await this.categoryRepo.find({
            order: { created_at: 'DESC' },
        });

        return categories;
    }

    async getOneCategory(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['orders']
        });
        if (!category) throw new NotFoundException('Category not found');

        return category
    }

    async updateOneCategory(id: number, updateCategoryDto: UpdateCategoryDto, images: Express.Multer.File[] = []) {
        const category = await this.getOneCategory(id)

        let imagesToDeleteArray: string[] = [];
        if (updateCategoryDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateCategoryDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    category.images = category.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = category.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            'tech_service_project/images/categories',
        );

        // Merge updates
        const updatedCategory = this.categoryRepo.merge(category, updateCategoryDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedCategory.images = [...(updatedCategory.images || []), ...imageUrls];
        }

        await this.categoryRepo.save(updatedCategory);

        return { message: 'Category updated successfully', category };
    }

    async deleteCategory(id: number) {
        const category = await this.getOneCategory(id)

        // Check if there are related orders
        if (category.orders && category.orders.length > 0) {
            throw new BadRequestException('Cannot delete category with existing orders');
        }

        // Delete images from Cloudinary if any
        if (category.images && category.images.length > 0) {
            await Promise.all(
                category.images.map((url) => this.cloudinaryService.deleteByUrl(url)),
            );
        }

        // Delete category
        await this.categoryRepo.remove(category);

        return {
            message: 'Category deleted successfully',
        };
    }

    // front
    async getActiveCategories(page: number, limit: number | undefined) {
        const skip = limit ? (page - 1) * limit : undefined;

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
            totalPages: limit ? Math.ceil(total / limit) : 1,
        };
    }
}
