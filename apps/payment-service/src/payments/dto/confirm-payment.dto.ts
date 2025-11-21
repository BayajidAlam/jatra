import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum ConfirmStatusDto {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class GatewayResponseDto {
  @ApiPropertyOptional({ example: 'AUTH123456' })
  authCode?: string;

  @ApiPropertyOptional({ example: 'BANK_REF_789' })
  bankReference?: string;

  @ApiProperty({ example: '2025-11-21T22:30:00Z' })
  timestamp: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'TXN_1732223400_abc123',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Payment status',
    enum: ConfirmStatusDto,
    example: ConfirmStatusDto.COMPLETED,
  })
  @IsEnum(ConfirmStatusDto)
  status: ConfirmStatusDto;

  @ApiPropertyOptional({
    description: 'Gateway response data',
    type: GatewayResponseDto,
  })
  @IsOptional()
  @IsObject()
  gatewayResponse?: GatewayResponseDto;
}
