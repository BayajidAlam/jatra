import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';

enum TrainType {
  INTERCITY = 'INTERCITY',
  MAIL_EXPRESS = 'MAIL_EXPRESS',
  COMMUTER = 'COMMUTER',
  LOCAL = 'LOCAL',
}

export class CreateTrainDto {
  @ApiProperty({ example: 'SUBORNO-EXPRESS-701', description: 'Unique train number' })
  @IsString()
  trainNumber: string;

  @ApiProperty({ example: 'Suborno Express', description: 'Train name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: TrainType, example: TrainType.INTERCITY, description: 'Type of train' })
  @IsEnum(TrainType)
  type: TrainType;

  @ApiProperty({ example: true, description: 'Is train active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
