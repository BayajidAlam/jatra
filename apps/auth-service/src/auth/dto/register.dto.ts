import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    description: "National ID (NID) - must be 10 or 13 digits",
    example: "1234567890",
  })
  @IsNotEmpty({ message: "NID is required" })
  @IsString()
  @Matches(/^[0-9]{10}$|^[0-9]{13}$/, {
    message: "NID must be 10 or 13 digits",
  })
  nid: string;

  @ApiProperty({
    description: "Email address",
    example: "user@example.com",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    description: "Bangladesh phone number",
    example: "+8801712345678",
  })
  @IsNotEmpty({ message: "Phone is required" })
  @IsString()
  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message:
      "Phone must be valid Bangladesh number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
  })
  phone: string;

  @ApiProperty({
    description: "Full name",
    example: "John Doe",
  })
  @IsNotEmpty({ message: "Name is required" })
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(255, { message: "Name must not exceed 255 characters" })
  name: string;

  @ApiProperty({
    description: "Password - must contain uppercase, lowercase, and number",
    example: "SecurePass123",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;
}
