import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import {
  IEmailProvider,
  EmailProviderConfig,
  SendEmailParams,
  SendEmailResult,
} from "./email-provider.interface";

@Injectable()
export class MailgunEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(MailgunEmailProvider.name);
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailProviderConfig | null = null;
  private configured = false;

  async initialize(config: EmailProviderConfig): Promise<void> {
    this.config = config;

    if (!config.user || !config.password) {
      this.logger.warn("⚠️  Mailgun credentials not provided");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.host || "smtp.mailgun.org",
        port: config.port || 587,
        secure: config.secure || false,
        auth: {
          user: config.user,
          pass: config.password,
        },
        tls: {
          ciphers: "SSLv3",
        },
      });

      // Verify connection
      const isValid = await this.verify();
      if (isValid) {
        this.configured = true;
        this.logger.log("✅ Mailgun SMTP provider initialized successfully");
      }
    } catch (error) {
      this.logger.error(
        "❌ Failed to initialize Mailgun provider:",
        error.message
      );
      this.transporter = null;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.transporter !== null;
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Mailgun provider not configured",
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: params.from || this.config.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.log(
        `✅ Email sent via Mailgun to ${params.to}: ${info.messageId}`
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`❌ Mailgun send failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error("❌ Mailgun verification failed:", error.message);
      return false;
    }
  }

  getProviderName(): string {
    return "Mailgun";
  }
}
