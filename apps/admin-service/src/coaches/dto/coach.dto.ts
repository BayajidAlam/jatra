import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum CoachType {
  AC_BERTH = 'AC_BERTH',
  AC_SEAT = 'AC_SEAT',
  AC_CHAIR = 'AC_CHAIR',
  SNIGDHA = 'SNIGDHA',
  SHOVAN = 'SHOVAN',
  SHOVAN_CHAIR = 'SHOVAN_CHAIR',
}

export class CreateCoachDto {
  @ApiProperty({ example: 'KA' })
  @IsString()
  @IsNotEmpty()
  coachCode: string;

  @ApiProperty({ enum: CoachType, example: 'AC_BERTH' })
  @IsEnum(CoachType)
  @IsNotEmpty()
  coachType: CoachType;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  totalSeats: number;

  @ApiProperty({ example: 'train-uuid' })
  @IsString()
  @IsNotEmpty()
  trainId: string;
}

export class UpdateCoachDto {
  @ApiPropertyOptional({ example: 'KHA' })
  @IsOptional()
  @IsString()
  coachCode?: string;

  @ApiPropertyOptional({ enum: CoachType, example: 'AC_SEAT' })
  @IsOptional()
  @IsEnum(CoachType)
  coachType?: CoachType;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number;
}

export class QueryCoachesDto {
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

  @ApiPropertyOptional({ example: 'train-uuid' })
  @IsOptional()
  @IsString()
  trainId?: string;
}
