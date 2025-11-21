import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, IsIn } from 'class-validator';

export enum PaymentStatusQuery {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}

export class QueryPaymentDto {
  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatusQuery,
    example: 'COMPLETED',
  })
  @IsOptional()
  @IsEnum(PaymentStatusQuery)
  status?: PaymentStatusQuery;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'amount'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'amount'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: string;
}
