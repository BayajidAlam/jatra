import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Acquire a lock atomically using SET NX EX
   * @returns true if lock acquired, false if already exists
   */
  async acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, value, {
      NX: true,
      EX: ttlSeconds,
    });
    return result === 'OK';
  }

  /**
   * Check if a lock exists and return its value
   */
  async checkLock(key: string): Promise<string | null> {
    const result = await this.client.get(key);
    return result as string | null;
  }

  /**
   * Extend lock TTL
   */
  async extendLock(key: string, additionalSeconds: number): Promise<boolean> {
    const ttl = await this.client.ttl(key);
    if (ttl > 0) {
      await this.client.expire(key, ttl + additionalSeconds);
      return true;
    }
    return false;
  }

  /**
   * Release a lock
   */
  async releaseLock(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result > 0;
  }

  /**
   * Get all keys matching a pattern
   */
  async getKeys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Get multiple values at once
   */
  async mGet(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    const result = await this.client.mGet(keys);
    return result as (string | null)[];
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * Delete multiple keys
   */
  async deleteKeys(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return await this.client.del(keys);
  }
}
