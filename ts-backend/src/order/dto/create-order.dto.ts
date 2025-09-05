import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsNumber()
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
