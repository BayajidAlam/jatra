import { Injectable, Logger } from "@nestjs/common";
import { Twilio } from "twilio";
import {
  ISmsProvider,
  SmsProviderConfig,
  SendSmsParams,
  SendSmsResult,
} from "./sms-provider.interface";

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: Twilio | null = null;
  private config: SmsProviderConfig | null = null;
  private configured = false;

  async initialize(config: SmsProviderConfig): Promise<void> {
    this.config = config;

    if (!config.accountSid || !config.authToken) {
      this.logger.warn("⚠️  Twilio credentials not provided");
      return;
    }

    if (!config.fromNumber) {
      this.logger.warn("⚠️  Twilio from number not provided");
      return;
    }

    try {
      this.client = new Twilio(config.accountSid, config.authToken);
      this.configured = true;
      this.logger.log("✅ Twilio SMS provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "❌ Failed to initialize Twilio provider:",
        error.message
      );
      this.client = null;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.client !== null;
  }

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Twilio provider not configured",
      };
    }

    try {
      const message = await this.client.messages.create({
        body: params.message,
        from: params.from || this.config.fromNumber,
        to: params.to,
      });

      this.logger.log(`✅ SMS sent via Twilio to ${params.to}: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      this.logger.error(`❌ Twilio send failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getProviderName(): string {
    return "Twilio";
  }
}
