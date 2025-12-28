import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';

export class UpdateAdminOrderDto {
    @IsOptional()
    @IsNumber()
    technicianId: number;

    @IsOptional()
    @IsNumber()
    deliveryId: number;

    @IsOptional()
    @IsEnum(OrderType)
    service_type: OrderType;

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
