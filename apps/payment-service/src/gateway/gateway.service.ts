import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  cardDetails?: any;
  mobileNumber?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  authCode?: string;
  bankReference?: string;
  failureReason?: string;
  timestamp: Date;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly successRate = parseFloat(process.env.PAYMENT_SUCCESS_RATE || '0.9');
  private readonly processingDelay = parseInt(process.env.PAYMENT_PROCESSING_DELAY_MS || '3000');

  /**
   * Process payment through mock gateway
   */
  async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    const transactionId = this.generateTransactionId();
    
    this.logger.log(`Processing payment: ${transactionId}, Amount: ${request.amount} ${request.currency}`);

    // Simulate processing delay
    await this.delay(this.processingDelay);

    // Simulate success/failure based on success rate
    const isSuccess = Math.random() < this.successRate;

    if (isSuccess) {
      return {
        success: true,
        transactionId,
        status: 'COMPLETED',
        authCode: this.generateAuthCode(),
        bankReference: `BANK_${Date.now()}`,
        timestamp: new Date(),
      };
    } else {
      const failureReason = this.getRandomFailureReason();
      this.logger.warn(`Payment failed: ${transactionId}, Reason: ${failureReason}`);
      
      return {
        success: false,
        transactionId,
        status: 'FAILED',
        failureReason,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check payment status (mock)
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentGatewayResponse> {
    this.logger.log(`Checking payment status: ${transactionId}`);

    // In a real implementation, this would query the gateway
    // For now, we'll return a mock response
    return {
      success: true,
      transactionId,
      status: 'COMPLETED',
      authCode: this.generateAuthCode(),
      timestamp: new Date(),
    };
  }

  /**
   * Verify webhook signature (mock)
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const secretKey = process.env.GATEWAY_SECRET_KEY || 'mock-secret';
    
    // In real implementation, use HMAC-SHA256
    // const hmac = crypto.createHmac('sha256', secretKey);
    // const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
    // return signature === expectedSignature;

    // Mock verification - always returns true for now
    this.logger.log('Verifying webhook signature (mock)');
    return true;
  }

  /**
   * Process refund through gateway (mock)
   */
  async processRefund(transactionId: string, amount: number): Promise<PaymentGatewayResponse> {
    this.logger.log(`Processing refund: ${transactionId}, Amount: ${amount}`);

    await this.delay(2000); // Simulate delay

    const refundTransactionId = `REFUND_${this.generateTransactionId()}`;

    return {
      success: true,
      transactionId: refundTransactionId,
      status: 'COMPLETED',
      bankReference: `REFUND_${Date.now()}`,
      timestamp: new Date(),
    };
  }

  // Helper methods
  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;
  }

  private generateAuthCode(): string {
    return `AUTH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  private getRandomFailureReason(): string {
    const reasons = [
      'Insufficient funds',
      'Card declined by bank',
      'Invalid card details',
      'Transaction timeout',
      'Bank network error',
      'Card expired',
      'Invalid CVV',
      'Transaction limit exceeded',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
