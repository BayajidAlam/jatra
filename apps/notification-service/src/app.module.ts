import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsModule } from "./notifications/notifications.module";
import { SmsModule } from "./sms/sms.module";
import { PrismaService } from "./common/prisma.service";
import { RabbitMQModule } from "./common/rabbitmq.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    NotificationsModule,
    SmsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
