import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from "@nestjs/common";
import * as amqp from "amqplib";
import { randomUUID } from "crypto";
import { TicketsService } from "../tickets/tickets.service";
import {
  BookingConfirmedEvent,
  Exchanges,
  EventRoutingKeys,
  SendEmailEvent,
} from "@jatra/common/interfaces";

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(@Inject(forwardRef(() => TicketsService)) private readonly ticketsService: TicketsService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      const bookingExchange = Exchanges.BOOKING;
      const ticketQueue = "ticket.events";

      // Assert exchange
      await this.channel.assertExchange(bookingExchange, "topic", {
        durable: true,
      });
      await this.channel.assertExchange(Exchanges.NOTIFICATION, "topic", {
        durable: true,
      });

      // Assert queue
      await this.channel.assertQueue(ticketQueue, { durable: true });

      // Bind to booking.confirmed event
      await this.channel.bindQueue(
        ticketQueue,
        bookingExchange,
        EventRoutingKeys.BOOKING_CONFIRMED
      );

      this.logger.log(
        `✅ Connected to RabbitMQ and listening on queue: ${ticketQueue}`
      );

      // Start consuming messages
      this.channel.consume(
        ticketQueue,
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
    if (event.eventType === EventRoutingKeys.BOOKING_CONFIRMED) {
      await this.handleBookingConfirmed(event as BookingConfirmedEvent);
    } else {
      this.logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }

  private async handleBookingConfirmed(event: BookingConfirmedEvent) {
    const { data } = event;

    try {
      this.logger.log(`🎫 Generating ticket for booking ${data.bookingId}`);

      // Generate ticket with QR code
      const ticket = await this.ticketsService.generateTicket({
        bookingId: data.bookingId,
      });

      this.logger.log(
        `✅ Ticket generated: ${ticket.ticketNumber} for booking ${data.bookingId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate ticket for booking ${data.bookingId}:`,
        error
      );
      throw error;
    }
  }

  private generateEventId(): string {
    return randomUUID();
  }

  async publishEvent(event: any, exchange: string): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        "RabbitMQ channel not available, skipping event publish"
      );
      return;
    }

    try {
      const message = JSON.stringify(event);

      this.channel.publish(exchange, event.eventType, Buffer.from(message), {
        persistent: true,
        contentType: "application/json",
        messageId: event.eventId,
      });

      this.logger.log(
        `📤 Published event: ${event.eventType} (ID: ${event.eventId})`
      );
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventType}`, error);
      throw error;
    }
  }

  async publishSendEmail(data: SendEmailEvent["data"]): Promise<void> {
    const event: SendEmailEvent = {
      eventId: this.generateEventId(),
      eventType: EventRoutingKeys.SEND_EMAIL,
      timestamp: new Date(),
      source: "ticket-service",
      data,
    };

    await this.publishEvent(event, Exchanges.NOTIFICATION);
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
