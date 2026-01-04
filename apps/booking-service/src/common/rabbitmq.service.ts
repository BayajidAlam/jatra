import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import * as amqp from "amqplib";
import { randomUUID } from "crypto";
import {
  DomainEvent,
  Exchanges,
  EventRoutingKeys,
  BookingConfirmedEvent,
  BookingCancelledEvent,
  PaymentFailedEvent,
} from "@jatra/common/interfaces";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Create exchanges
      await this.channel.assertExchange(Exchanges.BOOKING, "topic", {
        durable: true,
      });
      await this.channel.assertExchange(Exchanges.NOTIFICATION, "topic", {
        durable: true,
      });
      await this.channel.assertExchange(Exchanges.PAYMENT, "topic", {
        durable: true,
      });

      // Create queue for payment failure events
      const queue = "booking-service.payment-failed";
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(
        queue,
        Exchanges.PAYMENT,
        EventRoutingKeys.PAYMENT_FAILED
      );

      this.logger.log("✅ RabbitMQ connected and exchanges created");
    } catch (error) {
      this.logger.error("❌ Failed to connect to RabbitMQ", error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private generateEventId(): string {
    return randomUUID();
  }

  async publishEvent(event: DomainEvent, exchange: string): Promise<void> {
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

  async publishBookingConfirmed(
    data: BookingConfirmedEvent["data"]
  ): Promise<void> {
    const event: BookingConfirmedEvent = {
      eventId: this.generateEventId(),
      eventType: EventRoutingKeys.BOOKING_CONFIRMED,
      timestamp: new Date(),
      source: "booking-service",
      data,
    };

    await this.publishEvent(event, Exchanges.BOOKING);
  }

  async publishBookingCancelled(
    data: BookingCancelledEvent["data"]
  ): Promise<void> {
    const event: BookingCancelledEvent = {
      eventId: this.generateEventId(),
      eventType: EventRoutingKeys.BOOKING_CANCELLED,
      timestamp: new Date(),
      source: "booking-service",
      data,
    };

    await this.publishEvent(event, Exchanges.BOOKING);
  }

  // Subscribe to payment failure events
  async subscribeToPaymentFailures(
    callback: (event: PaymentFailedEvent) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available");
      return;
    }

    const queue = "booking-service.payment-failed";

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString()) as PaymentFailedEvent;
        this.logger.log(`📥 Received payment.failed event: ${event.eventId}`);

        await callback(event);

        this.channel.ack(msg);
        this.logger.log(`✅ Processed payment.failed event: ${event.eventId}`);
      } catch (error) {
        this.logger.error("Failed to process payment.failed event", error);
        this.channel.nack(msg, false, true); // Requeue on failure
      }
    });

    this.logger.log("👂 Subscribed to payment failure events");
  }

  /**
   * Generic publish method for simple message publishing
   */
  async publish(
    exchange: string,
    routingKey: string,
    data: any
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available, skipping publish");
      return;
    }

    try {
      const message = JSON.stringify({
        eventId: this.generateEventId(),
        eventType: routingKey,
        timestamp: new Date(),
        source: "booking-service",
        data,
      });

      this.channel.publish(exchange, routingKey, Buffer.from(message), {
        persistent: true,
        contentType: "application/json",
      });

      this.logger.log(`📤 Published message to ${exchange}:${routingKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish to ${exchange}:${routingKey}`,
        error
      );
      throw error;
    }
  }

  /**
   * Generic consume method for subscribing to a queue
   */
  async consume<T>(
    queue: string,
    callback: (message: T) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available");
      return;
    }

    // Ensure queue exists
    await this.channel.assertQueue(queue, { durable: true });

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const message = JSON.parse(msg.content.toString()) as T;
        this.logger.log(`📥 Received message from ${queue}`);

        await callback(message);

        this.channel.ack(msg);
        this.logger.log(`✅ Processed message from ${queue}`);
      } catch (error) {
        this.logger.error(`Failed to process message from ${queue}`, error);
        this.channel.nack(msg, false, true); // Requeue on failure
      }
    });

    this.logger.log(`👂 Subscribed to queue: ${queue}`);
  }
}
