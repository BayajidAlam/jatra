import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsEnum } from 'class-validator';
import { BookingStatus } from '@jatra/common/types';

export class QueryBookingsDto {
  @ApiPropertyOptional({ 
    example: 'CONFIRMED', 
    description: 'Filter by booking status',
    enum: BookingStatus
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: '1', description: 'Page number', default: '1' })
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiPropertyOptional({ example: '10', description: 'Items per page', default: '10' })
  @IsOptional()
  @IsString()
  limit?: string = '10';

  @ApiPropertyOptional({ 
    example: 'createdAt', 
    description: 'Sort by field',
    enum: ['createdAt', 'totalAmount', 'status']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    example: 'desc', 
    description: 'Sort order',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
