import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class SearchJourneysDto {
  @ApiProperty({ example: 'DHK', description: 'From station code' })
  @IsString()
  from: string;

  @ApiProperty({ example: 'CTG', description: 'To station code' })
  @IsString()
  to: string;

  @ApiProperty({ example: '2025-11-25', description: 'Journey date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'INTERCITY', description: 'Train type filter', required: false })
  @IsString()
  @IsOptional()
  trainType?: string;
}
