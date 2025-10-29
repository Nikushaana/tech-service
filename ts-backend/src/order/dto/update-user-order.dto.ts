import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserOrderDto {
    @IsOptional()
    @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsOptional()
    @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
    @IsNumber()
    @IsNotEmpty()
    addressId: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsIn(['მონტაჟი', 'შეკეთება'])
    service_type: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    model: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    imagesToDelete: string

    @IsOptional()
    @IsString()
    videosToDelete: string
}
