import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';
import { 
  DomainEvent, 
  Exchanges, 
  EventRoutingKeys,
  BookingConfirmedEvent,
  BookingCancelledEvent 
} from '@jatra/common/interfaces';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Create exchanges
      await this.channel.assertExchange(Exchanges.BOOKING, 'topic', { durable: true });
      await this.channel.assertExchange(Exchanges.NOTIFICATION, 'topic', { durable: true });

      this.logger.log('✅ RabbitMQ connected and exchanges created');
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ', error);
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
      this.logger.warn('RabbitMQ channel not available, skipping event publish');
      return;
    }

    try {
      const message = JSON.stringify(event);

      this.channel.publish(
        exchange,
        event.eventType,
        Buffer.from(message),
        { 
          persistent: true,
          contentType: 'application/json',
          messageId: event.eventId
        }
      );

      this.logger.log(`📤 Published event: ${event.eventType} (ID: ${event.eventId})`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventType}`, error);
      throw error;
    }
  }

  async publishBookingConfirmed(data: BookingConfirmedEvent['data']): Promise<void> {
    const event: BookingConfirmedEvent = {
      eventId: this.generateEventId(),
      eventType: EventRoutingKeys.BOOKING_CONFIRMED,
      timestamp: new Date(),
      source: 'booking-service',
      data,
    };

    await this.publishEvent(event, Exchanges.BOOKING);
  }

  async publishBookingCancelled(data: BookingCancelledEvent['data']): Promise<void> {
    const event: BookingCancelledEvent = {
      eventId: this.generateEventId(),
      eventType: EventRoutingKeys.BOOKING_CANCELLED,
      timestamp: new Date(),
      source: 'booking-service',
      data,
    };

    await this.publishEvent(event, Exchanges.BOOKING);
  }
}
