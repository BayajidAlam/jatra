import { IsString, IsEnum, IsDateString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePassengerDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'adult', enum: ['adult', 'child', 'infant'] })
  @IsEnum(['adult', 'child', 'infant'])
  type: string;

  @ApiPropertyOptional({ example: 'female', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ example: '1995-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'AB9876543' })
  @IsOptional()
  @IsString()
  nidNumber?: string;

  @ApiPropertyOptional({ example: 'P9876543' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+8801798765432' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePassengerDto {
  @ApiPropertyOptional({ example: 'Jane Smith Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'adult', enum: ['adult', 'child', 'infant'] })
  @IsOptional()
  @IsEnum(['adult', 'child', 'infant'])
  type?: string;

  @ApiPropertyOptional({ example: 'female', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ example: '1995-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'AB9876543' })
  @IsOptional()
  @IsString()
  nidNumber?: string;

  @ApiPropertyOptional({ example: 'P9876543' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+8801798765432' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
