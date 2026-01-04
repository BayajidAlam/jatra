import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ example: 'site_name' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Jatra Railway' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'general' })
  @IsOptional()
  @IsString()
  group?: string;
}

export class UpdateSettingDto {
  @ApiProperty({ example: 'Jatra Railway v2' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
