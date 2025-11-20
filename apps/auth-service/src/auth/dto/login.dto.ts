import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Login identifier - can be NID, email, or phone number",
    example: "1234567890",
  })
  @IsNotEmpty({ message: "Identifier is required" })
  @IsString()
  identifier: string; // Can be NID, email, or phone

  @ApiProperty({
    description: "User password",
    example: "SecurePass123",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password: string;
}
