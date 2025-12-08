import { Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { SSLCommerzService } from "./sslcommerz.service";

export type PaymentProvider = "SSLCOMMERZ" | "MOCK";

export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  cardDetails?: any;
  mobileNumber?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  status: "COMPLETED" | "FAILED" | "PROCESSING" | "PENDING";
  gatewayPageURL?: string;
  sessionKey?: string;
  authCode?: string;
  bankReference?: string;
  failureReason?: string;
  timestamp: Date;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly provider: PaymentProvider;
  private readonly successRate = parseFloat(
    process.env.PAYMENT_SUCCESS_RATE || "0.9"
  );
  private readonly processingDelay = parseInt(
    process.env.PAYMENT_PROCESSING_DELAY_MS || "3000"
  );
  private readonly sslCommerzService: SSLCommerzService;

  constructor() {
    this.provider =
      (process.env.PAYMENT_GATEWAY_PROVIDER as PaymentProvider) || "MOCK";
    this.sslCommerzService = new SSLCommerzService();

    this.logger.log(
      `✅ Payment Gateway initialized with provider: ${this.provider}`
    );
  }

  /**
   * Process payment through configured gateway
   */
  async processPayment(
    request: PaymentGatewayRequest
  ): Promise<PaymentGatewayResponse> {
    if (this.provider === "SSLCOMMERZ") {
      return this.processSSLCommerzPayment(request);
    } else {
      return this.processMockPayment(request);
    }
  }

  /**
   * Process payment through SSLCommerz
   */
  private async processSSLCommerzPayment(
    request: PaymentGatewayRequest
  ): Promise<PaymentGatewayResponse> {
    try {
      const transactionId = this.generateTransactionId();

      const initResponse = await this.sslCommerzService.initiatePayment({
        amount: request.amount,
        currency: request.currency,
        transactionId,
        successUrl: request.successUrl,
        failUrl: request.failUrl,
        cancelUrl: request.cancelUrl,
        ipnUrl: request.ipnUrl,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        productName: request.productName,
        productCategory: "Railway Ticket",
        productProfile: "general",
      });

      if (initResponse.status === "SUCCESS" && initResponse.GatewayPageURL) {
        return {
          success: true,
          transactionId,
          status: "PENDING",
          gatewayPageURL: initResponse.GatewayPageURL,
          sessionKey: initResponse.sessionkey,
          timestamp: new Date(),
        };
      } else {
        return {
          success: false,
          transactionId,
          status: "FAILED",
          failureReason:
            initResponse.failedreason || "Payment initiation failed",
          timestamp: new Date(),
        };
      }
    } catch (error) {
      this.logger.error("SSLCommerz payment processing error:", error);
      return {
        success: false,
        transactionId: this.generateTransactionId(),
        status: "FAILED",
        failureReason:
          error instanceof Error ? error.message : "Payment processing failed",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Process payment through mock gateway
   */
  private async processMockPayment(
    request: PaymentGatewayRequest
  ): Promise<PaymentGatewayResponse> {
    const transactionId = this.generateTransactionId();

    this.logger.log(
      `Processing mock payment: ${transactionId}, Amount: ${request.amount} ${request.currency}`
    );

    // Simulate processing delay
    await this.delay(this.processingDelay);

    // Simulate success/failure based on success rate
    const isSuccess = Math.random() < this.successRate;

    if (isSuccess) {
      return {
        success: true,
        transactionId,
        status: "COMPLETED",
        authCode: this.generateAuthCode(),
        bankReference: `BANK_${Date.now()}`,
        timestamp: new Date(),
      };
    } else {
      const failureReason = this.getRandomFailureReason();
      this.logger.warn(
        `Payment failed: ${transactionId}, Reason: ${failureReason}`
      );

      return {
        success: false,
        transactionId,
        status: "FAILED",
        failureReason,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate payment after callback from gateway
   */
  async validatePayment(
    validationId: string,
    transactionId: string
  ): Promise<PaymentGatewayResponse> {
    if (this.provider === "SSLCOMMERZ") {
      try {
        const validation = await this.sslCommerzService.validatePayment(
          validationId
        );

        return {
          success: true,
          transactionId: validation.tran_id,
          status: "COMPLETED",
          authCode: validation.val_id,
          bankReference: validation.bank_tran_id,
          timestamp: new Date(validation.tran_date),
        };
      } catch (error) {
        this.logger.error("Payment validation error:", error);
        return {
          success: false,
          transactionId,
          status: "FAILED",
          failureReason:
            error instanceof Error
              ? error.message
              : "Payment validation failed",
          timestamp: new Date(),
        };
      }
    } else {
      // Mock validation
      this.logger.log(`Checking mock payment status: ${transactionId}`);
      return {
        success: true,
        transactionId,
        status: "COMPLETED",
        authCode: this.generateAuthCode(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<any> {
    if (this.provider === "SSLCOMMERZ") {
      return this.sslCommerzService.checkTransactionStatus(transactionId);
    } else {
      this.logger.log(`Checking mock payment status: ${transactionId}`);
      return {
        success: true,
        transactionId,
        status: "COMPLETED",
        authCode: this.generateAuthCode(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate SSLCommerz IPN data
   */
  validateIPNData(ipnData: any): boolean {
    if (this.provider === "SSLCOMMERZ") {
      return this.sslCommerzService.validateIPNData(ipnData);
    } else {
      // Mock validation
      this.logger.log("Validating IPN data (mock)");
      return true;
    }
  }

  /**
   * Verify webhook signature (mock)
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const secretKey = process.env.GATEWAY_SECRET_KEY || "mock-secret";

    // In real implementation, use HMAC-SHA256
    // const hmac = crypto.createHmac('sha256', secretKey);
    // const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
    // return signature === expectedSignature;

    // Mock verification - always returns true for now
    this.logger.log("Verifying webhook signature (mock)");
    return true;
  }

  /**
   * Process refund through gateway
   */
  async processRefund(
    bankTransactionId: string,
    amount: number,
    remarks: string = "Refund requested by customer"
  ): Promise<PaymentGatewayResponse> {
    if (this.provider === "SSLCOMMERZ") {
      try {
        const refundResponse = await this.sslCommerzService.processRefund({
          bankTransactionId,
          refundAmount: amount,
          refundRemarks: remarks,
        });

        return {
          success: true,
          transactionId: refundResponse.refund_ref_id,
          status: "COMPLETED",
          bankReference: refundResponse.trans_id,
          timestamp: new Date(),
        };
      } catch (error) {
        this.logger.error("Refund processing error:", error);
        return {
          success: false,
          transactionId: bankTransactionId,
          status: "FAILED",
          failureReason:
            error instanceof Error ? error.message : "Refund processing failed",
          timestamp: new Date(),
        };
      }
    } else {
      // Mock refund
      this.logger.log(
        `Processing mock refund: ${bankTransactionId}, Amount: ${amount}`
      );
      await this.delay(2000);

      const refundTransactionId = `REFUND_${this.generateTransactionId()}`;

      return {
        success: true,
        transactionId: refundTransactionId,
        status: "COMPLETED",
        bankReference: `REFUND_${Date.now()}`,
        timestamp: new Date(),
      };
    }
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
      "Insufficient funds",
      "Card declined by bank",
      "Invalid card details",
      "Transaction timeout",
      "Bank network error",
      "Card expired",
      "Invalid CVV",
      "Transaction limit exceeded",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
