import { Module } from "@nestjs/common";
import { RabbitMQConsumerService } from "./rabbitmq-consumer.service";
import { EmailModule } from "../email/email.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [EmailModule, NotificationsModule],
  providers: [RabbitMQConsumerService],
  exports: [RabbitMQConsumerService],
})
export class RabbitMQModule {}
