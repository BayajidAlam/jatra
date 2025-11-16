import { IsString, IsDateString, IsArray } from "class-validator";

export class ReserveSeatDto {
  @IsString()
  trainId: string;

  @IsString()
  scheduleId: string;

  @IsString()
  coachId: string;

  @IsArray()
  @IsString({ each: true })
  seatIds: string[];

  @IsDateString()
  journeyDate: string;

  @IsString()
  userId: string;
}

export class ReleaseSeatDto {
  @IsString()
  trainId: string;

  @IsString()
  coachId: string;

  @IsArray()
  @IsString({ each: true })
  seatIds: string[];

  @IsDateString()
  journeyDate: string;
}

export class CheckSeatAvailabilityDto {
  @IsString()
  trainId: string;

  @IsString()
  scheduleId: string;

  @IsDateString()
  journeyDate: string;
}
