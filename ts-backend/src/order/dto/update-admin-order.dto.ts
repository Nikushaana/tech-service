import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';

export class UpdateAdminOrderDto {
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    addressId: number;

    @IsOptional()
    @IsNumber({}, { each: false })
    technicianId: number | null;

    @IsOptional()
    @IsNumber({}, { each: false })
    deliveryId: number | null;

    @IsOptional()
    @IsEnum(OrderType)
    service_type: OrderType;

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

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
