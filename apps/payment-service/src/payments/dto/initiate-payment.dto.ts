import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PaymentMethod } from "@jatra/common/types";

export class CardDetailsDto {
  @ApiProperty({
    example: "4111111111111111",
    description: "Card number (will be masked)",
  })
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  cardHolderName: string;

  @ApiProperty({ example: "12", description: "Expiry month (01-12)" })
  @IsString()
  expiryMonth: string;

  @ApiProperty({ example: "2026", description: "Expiry year" })
  @IsString()
  expiryYear: string;

  @ApiProperty({ example: "123", description: "CVV (not stored)" })
  @IsString()
  cvv: string;
}

export class InitiatePaymentDto {
  @ApiProperty({
    description: "Reservation ID to pay for",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsString()
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    description: "User ID making the payment",
    example: "660e8400-e29b-41d4-a716-446655440000",
  })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 3500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_BANKING,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: "Card details (required for card payments)",
    type: CardDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;

  @ApiPropertyOptional({
    description: "Mobile number (required for mobile banking)",
    example: "+8801712345678",
  })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({
    description: "Customer name",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: "Customer email",
    example: "john@example.com",
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;
}
