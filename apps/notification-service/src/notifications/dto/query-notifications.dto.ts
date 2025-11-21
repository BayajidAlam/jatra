import { IsEnum, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryNotificationsDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({ enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
