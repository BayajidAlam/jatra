import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum SeatType {
  BERTH_LOWER = 'BERTH_LOWER',
  BERTH_UPPER = 'BERTH_UPPER',
  SEAT = 'SEAT',
  CHAIR = 'CHAIR',
}

export class CreateSeatDto {
  @ApiProperty({ example: 'A1' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @ApiProperty({ enum: SeatType, example: 'SEAT' })
  @IsEnum(SeatType)
  @IsNotEmpty()
  seatType: SeatType;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  baseFare: number;

  @ApiProperty({ example: 'coach-uuid' })
  @IsString()
  @IsNotEmpty()
  coachId: string;
}

export class BulkCreateSeatsDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  prefix: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  startNumber: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  count: number;

  @ApiProperty({ enum: SeatType, example: 'SEAT' })
  @IsEnum(SeatType)
  @IsNotEmpty()
  seatType: SeatType;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  baseFare: number;

  @ApiProperty({ example: 'coach-uuid' })
  @IsString()
  @IsNotEmpty()
  coachId: string;
}

export class UpdateSeatDto {
  @ApiPropertyOptional({ example: 'A2' })
  @IsOptional()
  @IsString()
  seatNumber?: string;

  @ApiPropertyOptional({ enum: SeatType, example: 'CHAIR' })
  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @ApiPropertyOptional({ example: 1200.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFare?: number;
}

export class QuerySeatsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'coach-uuid' })
  @IsOptional()
  @IsString()
  coachId?: string;
}
