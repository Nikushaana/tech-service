import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';

class LocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class UpdateBranchDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    building_number: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    coverage_radius_km: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    delivery_price: string;

    @ValidateNested()
    @Type(() => LocationDto)
    @IsOptional()
    location: LocationDto;
}
