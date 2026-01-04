import { Module } from "@nestjs/common";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
// TODO: Re-enable PaymentQueueProcessor after RabbitMQ integration is complete
// import { PaymentQueueProcessor } from './payment-queue.processor';
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}
