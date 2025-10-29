import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['მონტაჟი', 'შეკეთება'])
    service_type: string;

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
