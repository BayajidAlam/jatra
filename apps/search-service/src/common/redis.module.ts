import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', '6379');
        const password = configService.get('REDIS_PASSWORD', '');
        const database = configService.get('REDIS_DB', '1');

        // Build Redis URL with authentication
        const redisUrl = password
          ? `redis://:${password}@${host}:${port}/${database}`
          : `redis://${host}:${port}/${database}`;

        console.log(`🔗 Connecting to Redis at ${host}:${port} (DB ${database})`);

        const client = createClient({
          url: redisUrl,
        });

        client.on('error', (err: Error) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('✅ Redis connected successfully'));
        client.on('ready', () => console.log('✅ Redis ready for commands'));

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
