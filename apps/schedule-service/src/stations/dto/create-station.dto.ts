import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'DHK', description: 'Unique station code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Kamalapur Railway Station', description: 'Station name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dhaka', description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Dhaka', description: 'District name' })
  @IsString()
  district: string;

  @ApiProperty({ example: 23.7104, description: 'Latitude', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 90.4074, description: 'Longitude', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: true, description: 'Is station active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
