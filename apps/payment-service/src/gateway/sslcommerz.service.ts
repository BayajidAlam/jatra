import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export interface SSLCommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
  sandboxUrl: string;
  productionUrl: string;
}

export interface SSLCommerzInitRequest {
  amount: number;
  currency: string;
  transactionId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productCategory: string;
  productProfile: string;
}

export interface SSLCommerzInitResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  gw?: {
    visa: string;
    master: string;
    amex: string;
    othercards: string;
    internetbanking: string;
    mobilbanking: string;
  };
  redirectGatewayURL?: string;
  redirectGatewayURLFailed?: string;
  GatewayPageURL?: string;
  storeBanner?: string;
  storeLogo?: string;
  desc?: string;
  is_direct_pay_enable?: string;
}

export interface SSLCommerzValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  currency_type: string;
  currency_amount: string;
  currency_rate: string;
  base_fair: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  risk_level: string;
  risk_title: string;
  error?: string;
}

export interface SSLCommerzRefundRequest {
  bankTransactionId: string;
  refundAmount: number;
  refundRemarks: string;
}

export interface SSLCommerzRefundResponse {
  status: string;
  trans_id: string;
  refund_ref_id: string;
  errorReason?: string;
}

@Injectable()
export class SSLCommerzService {
  private readonly logger = new Logger(SSLCommerzService.name);
  private config: SSLCommerzConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      storeId: process.env.SSLCOMMERZ_STORE_ID || "",
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
      isSandbox: process.env.SSLCOMMERZ_IS_SANDBOX === "true",
      sandboxUrl:
        process.env.SSLCOMMERZ_SANDBOX_URL || "https://sandbox.sslcommerz.com",
      productionUrl:
        process.env.SSLCOMMERZ_PRODUCTION_URL ||
        "https://securepay.sslcommerz.com",
    };

    this.baseUrl = this.config.isSandbox
      ? this.config.sandboxUrl
      : this.config.productionUrl;

    if (!this.config.storeId || !this.config.storePassword) {
      this.logger.warn(
        "⚠️  SSLCommerz credentials not configured. Payment gateway is disabled."
      );
    } else {
      this.logger.log(
        `✅ SSLCommerz initialized in ${
          this.config.isSandbox ? "SANDBOX" : "PRODUCTION"
        } mode`
      );
    }
  }

  /**
   * Initialize payment session with SSLCommerz
   */
  async initiatePayment(
    request: SSLCommerzInitRequest
  ): Promise<SSLCommerzInitResponse> {
    try {
      this.validateConfig();

      const payload = {
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        total_amount: request.amount,
        currency: request.currency,
        tran_id: request.transactionId,
        success_url: request.successUrl,
        fail_url: request.failUrl,
        cancel_url: request.cancelUrl,
        ipn_url: request.ipnUrl,
        shipping_method: "NO",
        product_name: request.productName,
        product_category: request.productCategory,
        product_profile: request.productProfile,
        cus_name: request.customerName,
        cus_email: request.customerEmail,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: request.customerPhone,
        cus_fax: request.customerPhone,
        ship_name: request.customerName,
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: "1000",
        ship_country: "Bangladesh",
      };

      this.logger.log(
        `Initiating payment: ${request.transactionId}, Amount: ${request.amount} ${request.currency}`
      );

      const response = await axios.post<SSLCommerzInitResponse>(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        new URLSearchParams(payload as any).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000,
        }
      );

      if (response.data.status === "SUCCESS") {
        this.logger.log(`✅ Payment session created: ${request.transactionId}`);
        return response.data;
      } else {
        this.logger.error(
          `❌ Payment initiation failed: ${response.data.failedreason}`
        );
        throw new Error(
          response.data.failedreason || "Payment initiation failed"
        );
      }
    } catch (error) {
      this.logger.error("Payment initiation error:", error);
      throw error;
    }
  }

  /**
   * Validate payment transaction
   */
  async validatePayment(
    validationId: string
  ): Promise<SSLCommerzValidationResponse> {
    try {
      this.validateConfig();

      const params = new URLSearchParams({
        val_id: validationId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        format: "json",
      });

      this.logger.log(`Validating payment: ${validationId}`);

      const response = await axios.get<SSLCommerzValidationResponse>(
        `${
          this.baseUrl
        }/validator/api/validationserverAPI.php?${params.toString()}`,
        {
          timeout: 30000,
        }
      );

      if (
        response.data.status === "VALID" ||
        response.data.status === "VALIDATED"
      ) {
        this.logger.log(`✅ Payment validated: ${validationId}`);
        return response.data;
      } else {
        this.logger.error(
          `❌ Payment validation failed: ${
            response.data.error || response.data.status
          }`
        );
        throw new Error(response.data.error || "Payment validation failed");
      }
    } catch (error) {
      this.logger.error("Payment validation error:", error);
      throw error;
    }
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(transactionId: string): Promise<any> {
    try {
      this.validateConfig();

      const params = new URLSearchParams({
        tran_id: transactionId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        format: "json",
      });

      this.logger.log(`Checking transaction status: ${transactionId}`);

      const response = await axios.get(
        `${
          this.baseUrl
        }/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`,
        {
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error("Transaction status check error:", error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    request: SSLCommerzRefundRequest
  ): Promise<SSLCommerzRefundResponse> {
    try {
      this.validateConfig();

      const payload = {
        bank_tran_id: request.bankTransactionId,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        refund_amount: request.refundAmount,
        refund_remarks: request.refundRemarks,
        refe_id: uuidv4(),
        format: "json",
      };

      this.logger.log(
        `Processing refund: ${request.bankTransactionId}, Amount: ${request.refundAmount}`
      );

      const response = await axios.post<SSLCommerzRefundResponse>(
        `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`,
        new URLSearchParams(payload as any).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000,
        }
      );

      if (response.data.status === "success") {
        this.logger.log(`✅ Refund processed: ${response.data.refund_ref_id}`);
        return response.data;
      } else {
        this.logger.error(`❌ Refund failed: ${response.data.errorReason}`);
        throw new Error(
          response.data.errorReason || "Refund processing failed"
        );
      }
    } catch (error) {
      this.logger.error("Refund processing error:", error);
      throw error;
    }
  }

  /**
   * Validate SSLCommerz IPN (Instant Payment Notification) data
   */
  validateIPNData(ipnData: any): boolean {
    // Basic validation - check required fields
    const requiredFields = [
      "val_id",
      "tran_id",
      "amount",
      "card_type",
      "status",
    ];

    for (const field of requiredFields) {
      if (!ipnData[field]) {
        this.logger.error(`IPN validation failed: Missing field ${field}`);
        return false;
      }
    }

    // Check if status is valid
    const validStatuses = ["VALID", "VALIDATED", "SUCCESS"];
    if (!validStatuses.includes(ipnData.status)) {
      this.logger.error(
        `IPN validation failed: Invalid status ${ipnData.status}`
      );
      return false;
    }

    return true;
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.storeId || !this.config.storePassword) {
      throw new Error("SSLCommerz credentials not configured");
    }
  }
}
