import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsOptional()
    @IsString()
    apartment_number: string;

    @IsOptional()
    @IsString()
    building_floor: string;

    @IsOptional()
    @IsString()
    building_entrance: string;

    @IsString()
    @IsNotEmpty()
    building_number: string;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
