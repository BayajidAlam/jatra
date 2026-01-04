import { Injectable, Logger } from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationStatus } from "@jatra/common/types";
import {
  ISmsProvider,
  SmsProvider,
  TwilioSmsProvider,
  MockSmsProvider,
} from "./providers";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private smsProvider: ISmsProvider;

  constructor(private readonly notificationsService: NotificationsService) {
    this.initializeProvider();
  }

  private async initializeProvider() {
    const providerType = (
      process.env.SMS_PROVIDER || SmsProvider.MOCK
    ).toUpperCase();

    this.logger.log(`📱 Initializing SMS provider: ${providerType}`);

    switch (providerType) {
      case SmsProvider.TWILIO:
        this.smsProvider = new TwilioSmsProvider();
        break;
      case SmsProvider.MOCK:
      default:
        this.smsProvider = new MockSmsProvider();
        break;
    }

    await this.smsProvider.initialize({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    });

    if (!this.smsProvider.isConfigured()) {
      this.logger.warn(
        `⚠️  ${this.smsProvider.getProviderName()} provider not configured. SMS sending may be disabled.`
      );
    }
  }

  async sendSms(
    to: string,
    message: string,
    notificationId: number
  ): Promise<void> {
    if (!this.smsProvider.isConfigured()) {
      const errorMsg = `${this.smsProvider.getProviderName()} provider not configured`;
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
        const result = await this.smsProvider.sendSms({
          to,
          message,
        });

        if (!result.success) {
          throw new Error(result.error || "SMS sending failed");
        }

        this.logger.log(`✅ SMS sent to ${to}: ${result.messageId}`);

        await this.notificationsService.updateNotificationStatus(
          notificationId,
          NotificationStatus.SENT,
          null
        );

        return;
      } catch (error) {
        this.logger.error(
          `❌ Failed to send SMS (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error.message
        );

        if (attempt < maxRetries) {
          await this.notificationsService.updateNotificationStatus(
            notificationId,
            NotificationStatus.RETRYING,
            error.message,
            attempt + 1
          );

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          await this.notificationsService.updateNotificationStatus(
            notificationId,
            NotificationStatus.FAILED,
            error.message,
            attempt
          );

          this.logger.error(
            `❌ SMS sending failed after ${
              maxRetries + 1
            } attempts for notification ${notificationId}`
          );
          return;
        }
      }
    }
  }

  async sendOtp(
    phoneNumber: string,
    otp: string,
    notificationId: number
  ): Promise<void> {
    const message = `Your Jatra Railway OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    await this.sendSms(phoneNumber, message, notificationId);
  }

  async sendBookingConfirmationSms(
    phoneNumber: string,
    bookingId: string,
    trainName: string,
    notificationId: number
  ): Promise<void> {
    const message = `Booking confirmed! ${trainName}, Booking ID: ${bookingId}. Check your email for details.`;
    await this.sendSms(phoneNumber, message, notificationId);
  }

  async sendCancellationSms(
    phoneNumber: string,
    bookingId: string,
    notificationId: number
  ): Promise<void> {
    const message = `Booking ${bookingId} has been cancelled. Refund will be processed within 5-7 business days.`;
    await this.sendSms(phoneNumber, message, notificationId);
  }
}
