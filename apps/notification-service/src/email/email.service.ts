import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationStatus } from "@jatra/common/types";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private templateCache: Map<string, handlebars.TemplateDelegate> = new Map();
  private isSmtpConfigured = false;

  constructor(private readonly notificationsService: NotificationsService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn(
        "⚠️  SMTP credentials not configured. Email sending is disabled."
      );
      this.logger.warn(
        "To enable emails, configure SMTP_USER and SMTP_PASS in .env file"
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection asynchronously
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error("❌ SMTP connection failed:", error.message);
          this.logger.warn(
            "Email sending is disabled. Check your SMTP credentials."
          );
          this.transporter = null;
        } else {
          this.logger.log("✅ SMTP server is ready to send emails");
          this.isSmtpConfigured = true;
        }
      });
    } catch (error) {
      this.logger.error("❌ Failed to initialize SMTP transporter:", error);
      this.transporter = null;
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
    // Check if SMTP is configured
    if (!this.transporter || !this.isSmtpConfigured) {
      const errorMsg = "SMTP not configured or connection failed";
      this.logger.warn(
        `⚠️  ${errorMsg}. Notification ${notificationId} marked as FAILED.`
      );

      await this.notificationsService.updateNotificationStatus(
        notificationId,
        NotificationStatus.FAILED,
        errorMsg,
        0
      );

      return; // Don't throw error, just log and mark as failed
    }

    const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || "3");
    const retryDelay = parseInt(process.env.RETRY_DELAY_MS || "5000");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Load and compile template
        const template = await this.loadTemplate(templateName);
        const html = template(context);

        // Send email
        const info = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to,
          subject,
          html,
        });

        this.logger.log(`✅ Email sent to ${to}: ${info.messageId}`);

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
          // Don't throw error, just log it
          return;
        }
      }
    }
  }
}
