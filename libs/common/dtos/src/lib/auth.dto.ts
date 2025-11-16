/**
 * Auth DTOs
 *
 * Installation required in service implementations:
 * npm install class-validator class-transformer
 */

// Decorator imports - will be available in actual services
// import { IsEmail, IsString, IsPhoneNumber, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber("BD")
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @IsString()
  identifier: string; // email or phone

  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  otp: string;

  @IsEnum(["LOGIN", "REGISTRATION", "BOOKING_VERIFICATION"])
  purpose: string;
}

export class SendOtpDto {
  @IsPhoneNumber("BD")
  phone: string;

  @IsEnum(["LOGIN", "REGISTRATION", "BOOKING_VERIFICATION"])
  purpose: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
