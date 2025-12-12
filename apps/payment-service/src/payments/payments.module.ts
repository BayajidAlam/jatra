import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../common/prisma.service';
import { RabbitMQService } from '../common/rabbitmq.service';
import { RedisService } from '../common/redis.service';
import { GatewayModule } from '../gateway/gateway.module';
import { IdempotencyService } from '@jatra/common/services';

@Module({
  imports: [GatewayModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    RabbitMQService,
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (redisService: RedisService) => redisService.getClient(),
      inject: [RedisService],
    },
    IdempotencyService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
