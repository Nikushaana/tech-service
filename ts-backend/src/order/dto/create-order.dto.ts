import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    categoryId: number;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    addressId: number;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
