import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
    imports: [TypeOrmModule.forFeature([Category]), CloudinaryModule],
    providers: [CategoryService],
    exports: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
