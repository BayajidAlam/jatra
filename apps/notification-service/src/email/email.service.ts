import { Injectable, Logger } from "@nestjs/common";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationStatus } from "@jatra/common/types";
import {
  IEmailProvider,
  EmailProvider,
  MailgunEmailProvider,
  MockEmailProvider,
} from "./providers";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailProvider: IEmailProvider;
  private templateCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {
    this.initializeProvider();
  }

  private async initializeProvider() {
    // Determine which provider to use based on environment variable
    const providerType = (
      process.env.EMAIL_PROVIDER || EmailProvider.MOCK
    ).toUpperCase();

    this.logger.log(`📧 Initializing email provider: ${providerType}`);

    // Create provider instance
    switch (providerType) {
      case EmailProvider.MAILGUN:
        this.emailProvider = new MailgunEmailProvider();
        break;
      case EmailProvider.MOCK:
      default:
        this.emailProvider = new MockEmailProvider();
        break;
    }

    // Initialize provider with configuration
    await this.emailProvider.initialize({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    });

    if (!this.emailProvider.isConfigured()) {
      this.logger.warn(
        `⚠️  ${this.emailProvider.getProviderName()} provider not configured. Email sending may be disabled.`
      );
    }
  }

  private async loadTemplate(
    templateName: string
  ): Promise<handlebars.TemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    const templatePath = path.join(
      __dirname,
      "../templates",
      `${templateName}.hbs`
    );
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(templateSource);

    this.templateCache.set(templateName, template);
    return template;
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
    notificationId: number
  ): Promise<void> {
    // Check if provider is configured
    if (!this.emailProvider.isConfigured()) {
      const errorMsg = `${this.emailProvider.getProviderName()} provider not configured`;
      this.logger.warn(
        `⚠️  ${errorMsg}. Notification ${notificationId} marked as FAILED.`
      );

      await this.notificationsService.updateNotificationStatus(
        notificationId,
        NotificationStatus.FAILED,
        errorMsg,
        0
      );

      return;
    }

    const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || "3");
    const retryDelay = parseInt(process.env.RETRY_DELAY_MS || "5000");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Load and compile template
        const template = await this.loadTemplate(templateName);
        const html = template(context);

        // Send email using provider
        const result = await this.emailProvider.sendEmail({
          to,
          subject,
          html,
          from: process.env.SMTP_FROM,
        });

        if (!result.success) {
          throw new Error(result.error || "Email sending failed");
        }

        this.logger.log(`✅ Email sent to ${to}: ${result.messageId}`);

        // Update notification status to SENT
        await this.notificationsService.updateNotificationStatus(
          notificationId,
          NotificationStatus.SENT,
          null
        );

        return;
      } catch (error) {
        this.logger.error(
          `❌ Failed to send email (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error.message
        );

        if (attempt < maxRetries) {
          // Update status to RETRYING
          await this.notificationsService.updateNotificationStatus(
            notificationId,
            NotificationStatus.RETRYING,
            error.message,
            attempt + 1
          );

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          // Update status to FAILED
          await this.notificationsService.updateNotificationStatus(
            notificationId,
            NotificationStatus.FAILED,
            error.message,
            attempt
          );

          this.logger.error(
            `❌ Email sending failed after ${
              maxRetries + 1
            } attempts for notification ${notificationId}`
          );
          return;
        }
      }
    }
  }
}
