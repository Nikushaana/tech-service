import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class TechnicianRequestPaymentDto {
    @IsNumber()
    @IsPositive()
    payment_amount: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    payment_reason: string;
}
