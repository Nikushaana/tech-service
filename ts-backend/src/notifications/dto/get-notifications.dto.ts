import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class GetNotificationsDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
