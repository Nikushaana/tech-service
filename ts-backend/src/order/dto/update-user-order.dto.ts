import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderType } from 'src/common/types/order-type.enum';

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
    @IsEnum(OrderType)
    service_type: OrderType;

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
