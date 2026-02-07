import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetStreetsDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    city: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    street: string;
}