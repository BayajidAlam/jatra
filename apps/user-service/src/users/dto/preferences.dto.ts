import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'window', enum: ['window', 'aisle', 'any'] })
  @IsOptional()
  @IsEnum(['window', 'aisle', 'any'])
  preferredSeatType?: string;

  @ApiPropertyOptional({ example: 'ac', enum: ['ac', 'non-ac', 'sleeper', 'any'] })
  @IsOptional()
  @IsEnum(['ac', 'non-ac', 'sleeper', 'any'])
  preferredClass?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: 'en', enum: ['en', 'bn'] })
  @IsOptional()
  @IsEnum(['en', 'bn'])
  language?: string;

  @ApiPropertyOptional({ example: 'BDT', enum: ['BDT', 'USD'] })
  @IsOptional()
  @IsEnum(['BDT', 'USD'])
  currency?: string;

  @ApiPropertyOptional({ example: 'light', enum: ['light', 'dark', 'auto'] })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: string;
}
