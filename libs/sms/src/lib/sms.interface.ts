export interface SMSProvider {
  sendSMS(phone: string, message: string): Promise<SMSResponse>;
  sendOTP(phone: string, otp: string): Promise<SMSResponse>;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSConfig {
  provider: "SSL_WIRELESS" | "BULKSMS_BD" | "TWILIO";
  apiKey: string;
  apiSecret: string;
  senderId: string;
}
