import { IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class UpdateReviewDto {
    @IsOptional()
    @IsString()
    review?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    stars?: number;

    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
