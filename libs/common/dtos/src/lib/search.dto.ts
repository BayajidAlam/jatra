import { IsString, IsDateString, IsOptional, IsEnum } from "class-validator";

export class SearchTrainsDto {
  @IsString()
  fromStationId: string;

  @IsString()
  toStationId: string;

  @IsDateString()
  journeyDate: string;

  @IsOptional()
  @IsEnum([
    "AC_CHAIR",
    "AC_BERTH",
    "FIRST_CLASS",
    "SNIGDHA",
    "SHOVAN",
    "SHULOV",
  ])
  coachType?: string;
}

export class GetScheduleDto {
  @IsString()
  trainId: string;

  @IsDateString()
  date: string;
}

export class CheckAvailabilityDto {
  @IsString()
  trainId: string;

  @IsString()
  scheduleId: string;

  @IsDateString()
  journeyDate: string;

  @IsOptional()
  @IsString()
  coachType?: string;
}
