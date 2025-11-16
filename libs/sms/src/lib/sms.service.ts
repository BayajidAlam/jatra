import { SMSProvider, SMSResponse, SMSConfig } from "./sms.interface";

/**
 * SMS Service - Wrapper for multiple SMS providers
 * Supports: SSL Wireless, BulkSMS Bangladesh, Twilio
 */
export class SMSService implements SMSProvider {
  constructor(private config: SMSConfig) {}

  async sendSMS(phone: string, message: string): Promise<SMSResponse> {
    try {
      switch (this.config.provider) {
        case "SSL_WIRELESS":
          return await this.sendViaSSLWireless(phone, message);
        case "BULKSMS_BD":
          return await this.sendViaBulkSMSBD(phone, message);
        case "TWILIO":
          return await this.sendViaTwilio(phone, message);
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SMS sending failed",
      };
    }
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    const message = `Your Jatra OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    return this.sendSMS(phone, message);
  }

  private async sendViaSSLWireless(
    phone: string,
    message: string
  ): Promise<SMSResponse> {
    // SSL Wireless API implementation
    // TODO: Implement actual API call
    console.log(`[SSL Wireless] Sending SMS to ${phone}: ${message}`);

    return {
      success: true,
      messageId: `SSL-${Date.now()}`,
    };
  }

  private async sendViaBulkSMSBD(
    phone: string,
    message: string
  ): Promise<SMSResponse> {
    // BulkSMS Bangladesh API implementation
    // TODO: Implement actual API call
    console.log(`[BulkSMS BD] Sending SMS to ${phone}: ${message}`);

    return {
      success: true,
      messageId: `BULK-${Date.now()}`,
    };
  }

  private async sendViaTwilio(
    phone: string,
    message: string
  ): Promise<SMSResponse> {
    // Twilio API implementation
    // TODO: Implement actual API call
    console.log(`[Twilio] Sending SMS to ${phone}: ${message}`);

    return {
      success: true,
      messageId: `TWL-${Date.now()}`,
    };
  }

  /**
   * Format phone number to E.164 format (+880xxxxxxxxxx)
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // Add country code if not present
    if (!cleaned.startsWith("880")) {
      // Remove leading 0 if present
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      cleaned = "880" + cleaned;
    }

    return "+" + cleaned;
  }

  /**
   * Validate Bangladesh phone number
   */
  static isValidBDPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    // BD phone: 11 digits starting with 01 or 13/14/15 digits with country code
    return /^(01[3-9]\d{8}|8801[3-9]\d{8})$/.test(cleaned);
  }
}
