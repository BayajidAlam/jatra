import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as amqp from "amqplib";
import { EmailService } from "../email/email.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "@jatra/common/types";

interface BookingEvent {
  type: "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "PAYMENT_FAILED";
  bookingId: number;
  userId: string; // UUID string from User model
  userEmail: string;
  userName: string;
  bookingDetails: {
    bookingNumber: string;
    journeyDate: string;
    trainName: string;
    route: string;
    seatNumbers: string[];
    totalAmount: number;
  };
  timestamp: string;
}

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

      const exchange = process.env.RABBITMQ_EXCHANGE || "notifications";
      const queue = process.env.RABBITMQ_QUEUE || "notification_queue";

      // Assert exchange
      await this.channel.assertExchange(exchange, "topic", { durable: true });

      // Assert queue
      await this.channel.assertQueue(queue, { durable: true });

      // Bind queue to exchange with routing patterns
      await this.channel.bindQueue(queue, exchange, "booking.#");

      this.logger.log(
        `✅ Connected to RabbitMQ and listening on queue: ${queue}`
      );

      // Start consuming messages
      this.channel.consume(
        queue,
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
      const event: BookingEvent = JSON.parse(msg.content.toString());
      this.logger.log(
        `📩 Received event: ${event.type} for booking ${event.bookingId}`
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

  private async processEvent(event: BookingEvent) {
    let notificationType: NotificationType;
    let subject: string;
    let template: string;

    switch (event.type) {
      case "BOOKING_CONFIRMED":
        notificationType = NotificationType.BOOKING_CONFIRMED;
        subject = `Booking Confirmed - ${event.bookingDetails.bookingNumber}`;
        template = "booking-confirmed";
        break;
      case "BOOKING_CANCELLED":
        notificationType = NotificationType.BOOKING_CANCELLED;
        subject = `Booking Cancelled - ${event.bookingDetails.bookingNumber}`;
        template = "booking-cancelled";
        break;
      case "PAYMENT_FAILED":
        notificationType = NotificationType.PAYMENT_FAILED;
        subject = `Payment Failed - ${event.bookingDetails.bookingNumber}`;
        template = "payment-failed";
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.type}`);
        return;
    }

    try {
      // Create notification record
      const notification = await this.notificationsService.createNotification({
        userId: event.userId,
        type: notificationType,
        subject,
        content: `${event.type} for booking ${event.bookingDetails.bookingNumber}`,
        metadata: event.bookingDetails,
      });

      // Send email
      await this.emailService.sendEmail(
        event.userEmail,
        subject,
        template,
        {
          userName: event.userName,
          ...event.bookingDetails,
        },
        notification.id
      );

      this.logger.log(
        `✅ Notification sent successfully for booking ${event.bookingId}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process notification for booking ${event.bookingId}:`,
        error
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
