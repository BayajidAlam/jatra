import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(255, { message: "Name must not exceed 255 characters" })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message:
      "Phone must be valid Bangladesh number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
  })
  phone?: string;
}
