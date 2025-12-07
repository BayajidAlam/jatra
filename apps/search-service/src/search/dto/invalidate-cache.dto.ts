import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvalidateCacheDto {
  @ApiPropertyOptional({
    description: 'Specific cache keys to invalidate',
    example: ['search:journey:1:2:2025-12-15'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keys?: string[];

  @ApiPropertyOptional({
    description: 'Cache pattern to match (e.g., "search:journey:*")',
    example: 'search:journey:*',
  })
  @IsOptional()
  @IsString()
  pattern?: string;
}
