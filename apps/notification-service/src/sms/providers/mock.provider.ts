import { Injectable, Logger } from "@nestjs/common";
import {
  ISmsProvider,
  SmsProviderConfig,
  SendSmsParams,
  SendSmsResult,
} from "./sms-provider.interface";

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);
  private configured = false;
  private config: SmsProviderConfig | null = null;

  async initialize(config: SmsProviderConfig): Promise<void> {
    this.config = config;
    this.configured = true;
    this.logger.log("✅ Mock SMS provider initialized (no actual SMS sent)");
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Mock provider not configured",
      };
    }

    const mockMessageId = `mock-sms-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.logger.log(`📱 [MOCK] SMS would be sent to: ${params.to}`);
    this.logger.log(`📱 [MOCK] Message: ${params.message}`);
    this.logger.log(`📱 [MOCK] Message ID: ${mockMessageId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  getProviderName(): string {
    return "Mock";
  }
}
