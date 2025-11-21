import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate payment',
    description: 'Initialize a payment for a reservation through mock gateway',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    schema: {
      example: {
        paymentId: '550e8400-e29b-41d4-a716-446655440000',
        transactionId: 'TXN_1732223400_abc123',
        status: 'PROCESSING',
        amount: 3500,
        expiresAt: '2025-11-21T23:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payment details' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 409, description: 'Payment already exists' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'Confirm payment status (simulates gateway callback)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed',
    schema: {
      example: {
        success: true,
        payment: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'COMPLETED',
          amount: 3500,
        },
        message: 'Payment completed successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid transaction or status' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrieve payment details by payment ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Payment details retrieved' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({
    summary: 'Get payment by reservation ID',
    description: 'Retrieve payment details by reservation ID',
  })
  @ApiParam({
    name: 'reservationId',
    description: 'Reservation ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Payment details retrieved' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentByReservation(@Param('reservationId') reservationId: string) {
    return this.paymentsService.getPaymentByReservation(reservationId);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user payments',
    description: 'Retrieve all payments for a specific user with filters and pagination',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User payments retrieved',
    schema: {
      example: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        payments: [],
        total: 10,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  async getUserPayments(@Param('userId') userId: string, @Query() query: QueryPaymentDto) {
    return this.paymentsService.getUserPayments(userId, query);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Refund payment',
    description: 'Process full or partial refund for a completed payment',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed',
    schema: {
      example: {
        success: true,
        payment: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'REFUNDED',
        },
        refundAmount: 3500,
        message: 'Refund processed successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(@Param('id') id: string, @Body() dto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel payment',
    description: 'Cancel a pending or processing payment',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled',
    schema: {
      example: {
        success: true,
        payment: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'CANCELLED',
        },
        message: 'Payment cancelled successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async cancelPayment(@Param('id') id: string) {
    return this.paymentsService.cancelPayment(id);
  }
}
