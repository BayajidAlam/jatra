import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class PassengerDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  @Max(120)
  age: number;

  @IsString()
  gender: "MALE" | "FEMALE" | "OTHER";
}

export class CreateBookingDto {
  @IsString()
  trainId: string;

  @IsString()
  scheduleId: string;

  @IsDateString()
  journeyDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @IsArray()
  @IsString({ each: true })
  seatIds: string[];
}

export class ConfirmBookingDto {
  @IsString()
  bookingId: string;

  @IsString()
  paymentId: string;
}

export class CancelBookingDto {
  @IsString()
  bookingId: string;

  @IsString()
  reason?: string;
}
