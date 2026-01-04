import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../common/prisma.service";
import { RabbitMQService } from "../common/rabbitmq.service";
import { GatewayModule } from "../gateway/gateway.module";

@Module({
  imports: [GatewayModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, RabbitMQService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
