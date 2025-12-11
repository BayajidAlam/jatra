import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationType, NotificationChannel } from "@jatra/common/types";

export class CreateNotificationDto {
  @ApiProperty({ description: "User UUID" })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({
    enum: NotificationChannel,
    default: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  recipient?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
