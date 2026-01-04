import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum TrainType {
  INTERCITY = 'INTERCITY',
  MAIL_EXPRESS = 'MAIL_EXPRESS',
  COMMUTER = 'COMMUTER',
  LOCAL = 'LOCAL',
}

export class CreateTrainDto {
  @ApiProperty({ example: 'Suborno Express' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SUBORNO-EXPRESS-701' })
  @IsString()
  @IsNotEmpty()
  trainNumber: string;

  @ApiPropertyOptional({ enum: TrainType, example: 'INTERCITY' })
  @IsEnum(TrainType)
  @IsOptional()
  type?: TrainType;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  totalSeats?: number;
}

export class UpdateTrainDto {
  @ApiPropertyOptional({ example: 'Suborno Express Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'SUBORNO-EXPRESS-701' })
  @IsOptional()
  @IsString()
  trainNumber?: string;

  @ApiPropertyOptional({ enum: TrainType, example: 'INTERCITY' })
  @IsEnum(TrainType)
  @IsOptional()
  type?: TrainType;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryTrainsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Suborno' })
  @IsOptional()
  @IsString()
  search?: string;
}
