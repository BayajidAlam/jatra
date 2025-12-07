import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AutocompleteStationsDto {
  @ApiProperty({
    description: 'Search query for station name',
    example: 'Dhaka',
    minLength: 2,
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}
