import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserOrderDto {
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;
    
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    addressId: number;

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
}
