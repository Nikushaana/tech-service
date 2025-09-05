import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateAdminIndividualOrTechnicianDto {
    @IsOptional()
    @Matches(/^5[0-9]{8}$/, {
        message: 'Phone number must start with 5 and be 9 digits long',
    })
    phone: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password: string;
}
