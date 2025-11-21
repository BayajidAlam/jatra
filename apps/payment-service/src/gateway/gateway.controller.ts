import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

@ApiTags('gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment gateway webhook',
    description: 'Webhook endpoint for payment gateway callbacks',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed',
    schema: {
      example: {
        received: true,
        processed: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid signature or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleWebhook(@Body() payload: any) {
    // Verify signature
    const signature = payload.signature || '';
    const isValid = this.gatewayService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      return {
        received: true,
        processed: false,
        error: 'Invalid signature',
      };
    }

    // In real implementation, process the webhook data
    // For now, just acknowledge receipt
    return {
      received: true,
      processed: true,
    };
  }

  @Get('status/:transactionId')
  @ApiOperation({
    summary: 'Check payment status',
    description: 'Check payment status from gateway (mock)',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: 'TXN_1732223400_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved',
    schema: {
      example: {
        transactionId: 'TXN_1732223400_abc123',
        status: 'COMPLETED',
        amount: 3500,
        timestamp: '2025-11-21T22:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    const response = await this.gatewayService.checkPaymentStatus(transactionId);
    return {
      transactionId: response.transactionId,
      status: response.status,
      timestamp: response.timestamp,
    };
  }
}
