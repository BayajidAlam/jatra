import { Injectable, Logger } from "@nestjs/common";
import {
  IEmailProvider,
  EmailProviderConfig,
  SendEmailParams,
  SendEmailResult,
} from "./email-provider.interface";

@Injectable()
export class MockEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(MockEmailProvider.name);
  private configured = false;
  private config: EmailProviderConfig | null = null;

  async initialize(config: EmailProviderConfig): Promise<void> {
    this.config = config;
    this.configured = true;
    this.logger.log(
      "✅ Mock email provider initialized (no actual emails sent)"
    );
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Mock provider not configured",
      };
    }

    // Simulate email sending with random success/failure for testing
    const mockMessageId = `mock-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.logger.log(`📧 [MOCK] Email would be sent to: ${params.to}`);
    this.logger.log(`📧 [MOCK] Subject: ${params.subject}`);
    this.logger.log(`📧 [MOCK] Message ID: ${mockMessageId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  async verify(): Promise<boolean> {
    this.logger.log("✅ [MOCK] Email provider verification successful");
    return true;
  }

  getProviderName(): string {
    return "Mock";
  }
}
