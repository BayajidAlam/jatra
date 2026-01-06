import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJourneyDto {
  @ApiProperty({ example: 'train-uuid' })
  @IsString()
  @IsNotEmpty()
  trainId: string;

  @ApiProperty({ example: 'route-uuid' })
  @IsString()
  @IsNotEmpty()
  routeId: string;

  @ApiProperty({ example: '2023-12-25T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  departureTime: string;

  @ApiProperty({ example: '2023-12-25T14:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  arrivalTime: string;

  @ApiProperty({ example: '2023-12-25T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  journeyDate: string;

  @ApiPropertyOptional({ example: 'SCHEDULED' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateJourneyDto extends CreateJourneyDto {
   @ApiPropertyOptional()
   @IsOptional()
   trainId: string;

   @ApiPropertyOptional()
   @IsOptional()
   routeId: string;

   @ApiPropertyOptional()
   @IsOptional()
   departureTime: string;

   @ApiPropertyOptional()
   @IsOptional()
   arrivalTime: string;

   @ApiPropertyOptional()
   @IsOptional()
   journeyDate: string;
}
