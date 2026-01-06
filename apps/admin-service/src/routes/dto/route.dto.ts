import { IsInt, IsOptional, Min, IsString, IsNotEmpty, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RouteStopDto {
  @IsString()
  @IsNotEmpty()
  fromStationId: string;

  @IsString()
  @IsNotEmpty()
  toStationId: string;

  @IsInt()
  @Min(1)
  stopOrder: number;

  @IsNumber()
  @Min(0)
  distanceFromStart: number;

  @IsInt()
  @Min(0)
  durationMinutes: number;
}

export class CreateRouteDto {
  @ApiProperty({ example: 'Dhaka - Chattogram' })
  @IsString()
  @IsNotEmpty()
  routeName: string;

  @ApiProperty({ example: 320 })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [RouteStopDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops?: RouteStopDto[];
}

export class UpdateRouteDto extends CreateRouteDto {}

export class QueryRoutesDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'dhaka' })
  @IsOptional()
  search?: string;
}
