import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetCitiesDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    city: string;
}