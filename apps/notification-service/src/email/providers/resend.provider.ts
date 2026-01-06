import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import {
  IEmailProvider,
  EmailProviderConfig,
  SendEmailParams,
  SendEmailResult,
} from "./email-provider.interface";

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private resend: Resend | null = null;
  private fromEmail: string | null = null;
  private configured = false;

  async initialize(config: EmailProviderConfig): Promise<void> {
    const apiKey = config.apiKey || config.password; // Support both apiKey and password fields
    this.fromEmail = config.from;

    if (!apiKey) {
      this.logger.warn("⚠️  Resend API key not provided");
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.configured = true;
      this.logger.log("✅ Resend email provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "❌ Failed to initialize Resend provider:",
        error.message
      );
      this.resend = null;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.resend !== null;
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Resend provider not configured",
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: params.from || this.fromEmail,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        throw new Error(error.message || "Failed to send email");
      }

      this.logger.log(
        `✅ Email sent via Resend to ${params.to}: ${data.id}`
      );

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      this.logger.error(`❌ Resend send failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verify(): Promise<boolean> {
    return this.isConfigured();
  }

  getProviderName(): string {
    return "Resend";
  }
}
