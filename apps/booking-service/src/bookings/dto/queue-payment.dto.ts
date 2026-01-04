import { IsString, IsNumber, IsOptional, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QueuePaymentDto {
  @ApiProperty({
    description: "Booking ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  bookingId: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Reservation ID from seat service",
    example: "res-abc123",
  })
  @IsString()
  reservationId: string;

  @ApiProperty({
    description: "Payment amount in BDT",
    example: 1500,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "Payment method",
    example: "SSLCommerz",
    enum: ["SSLCommerz", "MOCK", "Card", "MobileBanking"],
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: "Additional payment details",
    example: {
      customerPhone: "+8801712345678",
      customerEmail: "user@example.com",
    },
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}
