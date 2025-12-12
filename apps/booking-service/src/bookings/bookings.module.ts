import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PaymentQueueProcessor } from './payment-queue.processor';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { IdempotencyService } from '@jatra/common/services';

@Module({
  controllers: [BookingsController],
  providers: [
    BookingsService,
    PaymentQueueProcessor,
    PrismaService,
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (redisService: RedisService) => redisService.getClient(),
      inject: [RedisService],
    },
    IdempotencyService,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
