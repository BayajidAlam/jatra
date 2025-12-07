import { IsString, IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchJourneysDto {
  @ApiProperty({
    description: 'Departure station ID or code',
    example: '1',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Arrival station ID or code',
    example: '2',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Journey date (YYYY-MM-DD)',
    example: '2025-12-15',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Force bypass cache',
    example: false,
    default: false,
  })
  @IsOptional()
  bypassCache?: boolean = false;
}
