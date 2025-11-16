export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  SSLCOMMERZ = "SSLCOMMERZ",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  ROCKET = "ROCKET",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface SSLCommerzPayment {
  sessionId: string;
  amount: number;
  currency: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface SSLCommerzResponse {
  status: string;
  transactionId: string;
  amount: string;
  currency: string;
  bankTransactionId?: string;
  cardType?: string;
  cardBrand?: string;
  validatedOn: string;
}
