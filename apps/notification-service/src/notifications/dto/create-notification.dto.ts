import { IsEnum, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, NotificationChannel } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: NotificationChannel, default: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
