import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as amqp from "amqplib";
import { EmailService } from "../email/email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType, NotificationChannel } from "@jatra/common/types";
import {
  BookingConfirmedEvent,
  BookingCancelledEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  Exchanges,
  EventRoutingKeys,
} from "@jatra/common/interfaces";

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      const bookingExchange = Exchanges.BOOKING;
      const paymentExchange = Exchanges.PAYMENT;
      const notificationQueue = "notification.events";

      // Assert exchanges
      await this.channel.assertExchange(bookingExchange, "topic", {
        durable: true,
      });
      await this.channel.assertExchange(paymentExchange, "topic", {
        durable: true,
      });

      // Assert queue
      await this.channel.assertQueue(notificationQueue, { durable: true });

      // Bind queue to multiple events
      await this.channel.bindQueue(
        notificationQueue,
        bookingExchange,
        EventRoutingKeys.BOOKING_CONFIRMED
      );
      await this.channel.bindQueue(
        notificationQueue,
        bookingExchange,
        EventRoutingKeys.BOOKING_CANCELLED
      );
      await this.channel.bindQueue(
        notificationQueue,
        paymentExchange,
        EventRoutingKeys.PAYMENT_COMPLETED
      );
      await this.channel.bindQueue(
        notificationQueue,
        paymentExchange,
        EventRoutingKeys.PAYMENT_FAILED
      );

      this.logger.log(
        `✅ Connected to RabbitMQ and listening on queue: ${notificationQueue}`
      );

      // Start consuming messages
      this.channel.consume(
        notificationQueue,
        (msg) => {
          if (msg) {
            this.handleMessage(msg);
          }
        },
        { noAck: false }
      );

      // Handle connection errors
      this.connection.on("error", (err) => {
        this.logger.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        this.logger.warn("RabbitMQ connection closed, reconnecting...");
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async handleMessage(msg: amqp.Message) {
    try {
      const event = JSON.parse(msg.content.toString());
      this.logger.log(
        `📩 Received event: ${event.eventType} (ID: ${event.eventId})`
      );

      await this.processEvent(event);

      // Acknowledge message
      this.channel.ack(msg);
    } catch (error) {
      this.logger.error("Error processing message:", error);
      // Reject and requeue message for retry
      this.channel.nack(msg, false, true);
    }
  }

  private async processEvent(event: any) {
    switch (event.eventType) {
      case EventRoutingKeys.BOOKING_CONFIRMED:
        await this.handleBookingConfirmed(event as BookingConfirmedEvent);
        break;
      case EventRoutingKeys.BOOKING_CANCELLED:
        await this.handleBookingCancelled(event as BookingCancelledEvent);
        break;
      case EventRoutingKeys.PAYMENT_COMPLETED:
        await this.handlePaymentCompleted(event as PaymentCompletedEvent);
        break;
      case EventRoutingKeys.PAYMENT_FAILED:
        await this.handlePaymentFailed(event as PaymentFailedEvent);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }

  private async handleBookingConfirmed(event: BookingConfirmedEvent) {
    const { data } = event;

    try {
      // Create notification record
      const notification = await this.notificationsService.createNotification({
        userId: data.userId,
        type: NotificationType.BOOKING_CONFIRMED,
        channel: NotificationChannel.EMAIL,
        recipient: data.email,
        subject: `Booking Confirmed - ${data.journey.trainName}`,
        content: `Your booking has been confirmed for ${data.journey.trainName} (${data.journey.trainNumber})`,
        metadata: { bookingId: data.bookingId },
      });

      // Send email
      await this.emailService.sendEmail(
        data.email,
        `Booking Confirmed - ${data.journey.trainName}`,
        "booking-confirmation",
        {
          bookingId: data.bookingId,
          trainName: data.journey.trainName,
          trainNumber: data.journey.trainNumber,
          departureTime: data.journey.departureTime,
          arrivalTime: data.journey.arrivalTime,
          fromStation: data.journey.fromStation,
          toStation: data.journey.toStation,
          seats: data.seats,
          totalAmount: data.totalAmount,
        },
        notification.id
      );

      this.logger.log(`✅ Sent booking confirmation to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking confirmation:`, error);
      throw error;
    }
  }

  private async handleBookingCancelled(event: BookingCancelledEvent) {
    const { data } = event;

    try {
      // Create notification record
      await this.notificationsService.createNotification({
        userId: data.userId,
        type: NotificationType.BOOKING_CANCELLED,
        channel: NotificationChannel.EMAIL,
        recipient: data.userId, // Email will be fetched from user
        subject: `Booking Cancelled`,
        content: `Your booking has been cancelled. Refund amount: $${data.refundAmount}`,
        metadata: { bookingId: data.bookingId, reason: data.reason },
      });

      this.logger.log(`✅ Sent booking cancellation notification`);
    } catch (error) {
      this.logger.error(`Failed to send booking cancellation:`, error);
      throw error;
    }
  }

  private async handlePaymentCompleted(event: PaymentCompletedEvent) {
    const { data } = event;

    try {
      await this.notificationsService.createNotification({
        userId: data.userId,
        type: NotificationType.PAYMENT_SUCCESS,
        channel: NotificationChannel.EMAIL,
        recipient: data.userId,
        subject: `Payment Successful`,
        content: `Payment of $${data.amount} completed successfully. Transaction ID: ${data.transactionId}`,
        metadata: {
          paymentId: data.paymentId,
          transactionId: data.transactionId,
        },
      });

      this.logger.log(`✅ Sent payment success notification`);
    } catch (error) {
      this.logger.error(`Failed to send payment success:`, error);
      throw error;
    }
  }

  private async handlePaymentFailed(event: PaymentFailedEvent) {
    const { data } = event;

    try {
      await this.notificationsService.createNotification({
        userId: data.userId,
        type: NotificationType.PAYMENT_FAILED,
        channel: NotificationChannel.EMAIL,
        recipient: data.userId,
        subject: `Payment Failed`,
        content: `Payment of $${data.amount} failed. Reason: ${data.reason}`,
        metadata: { paymentId: data.paymentId, errorCode: data.errorCode },
      });

      this.logger.log(`✅ Sent payment failure notification`);
    } catch (error) {
      this.logger.error(`Failed to send payment failure:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
