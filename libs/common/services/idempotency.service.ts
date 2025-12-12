import { Injectable, ConflictException, Logger, Inject } from "@nestjs/common";
import * as crypto from "crypto";
import { Redis } from "ioredis";

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly DEFAULT_TTL = 86400; // 24 hours

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Generate idempotency key from request data
   */
  generateKey(prefix: string, data: any): string {
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
    return `idempotency:${prefix}:${hash}`;
  }

  /**
   * Check if operation with this key already exists
   * If yes, return cached result
   * If no, return null (caller should proceed with operation)
   */
  async checkIdempotency<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.log(`Idempotent request detected: ${key}`);
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to check idempotency: ${error.message}`);
      return null; // On error, allow operation to proceed
    }
  }

  /**
   * Store operation result with idempotency key
   */
  async storeResult<T>(key: string, result: T, ttl?: number): Promise<void> {
    try {
      const expiry = ttl || this.DEFAULT_TTL;
      await this.redis.setex(key, expiry, JSON.stringify(result));
      this.logger.log(`Stored idempotency result: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store idempotency result: ${error.message}`);
      // Non-critical, don't throw
    }
  }

  /**
   * Acquire lock for idempotency key to prevent race conditions
   * Returns true if lock acquired, false if another request is processing
   */
  async acquireIdempotencyLock(
    key: string,
    ttl: number = 30
  ): Promise<boolean> {
    try {
      const lockKey = `${key}:lock`;
      const result = await this.redis.set(lockKey, "1", "EX", ttl, "NX");
      return result === "OK";
    } catch (error) {
      this.logger.error(`Failed to acquire idempotency lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Release idempotency lock
   */
  async releaseIdempotencyLock(key: string): Promise<void> {
    try {
      const lockKey = `${key}:lock`;
      await this.redis.del(lockKey);
    } catch (error) {
      this.logger.error(`Failed to release idempotency lock: ${error.message}`);
    }
  }

  /**
   * Clear idempotency cache for a key (useful for retries after failure)
   */
  async clearIdempotency(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.log(`Cleared idempotency cache: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to clear idempotency: ${error.message}`);
    }
  }
}
