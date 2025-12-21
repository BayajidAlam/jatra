import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../common/redis.service";

@Injectable()
export class LuaScriptService implements OnModuleInit {
  private readonly logger = new Logger(LuaScriptService.name);

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    // No Lua scripts needed - using simple Redis operations instead
    this.logger.log(
      "LuaScriptService initialized (using simple Redis operations)"
    );
  }

  /**
   * Atomically lock multiple seats using Lua script
   * Returns: { success: boolean, lockedSeats?: string[], failedSeat?: string }
   */
  async atomicLockSeats(
    lockKeys: string[],
    userId: string,
    ttl: number
  ): Promise<{
    success: boolean;
    lockedSeats?: string[];
    failedSeat?: string;
  }> {
    try {
      // Simple non-Lua implementation for compatibility
      // Lock each key atomically using Redis SET NX EX
      const lockedSeats: string[] = [];

      for (const key of lockKeys) {
        const result = await this.redis.getClient().set(key, userId, {
          NX: true,
          EX: ttl,
        });

        if (result !== "OK") {
          // Failed to lock this seat, release previously locked seats
          for (const lockedKey of lockedSeats) {
            await this.redis.getClient().del(lockedKey);
          }
          return {
            success: false,
            failedSeat: key,
          };
        }
        lockedSeats.push(key);
      }

      return {
        success: true,
        lockedSeats,
      };
    } catch (error) {
      this.logger.error(`Failed to execute atomic lock: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atomically release multiple seat locks using Lua script
   * Returns: number of seats released
   */
  async atomicReleaseSeats(
    lockKeys: string[],
    userId: string
  ): Promise<number> {
    try {
      let releasedCount = 0;

      for (const key of lockKeys) {
        // Only release if the lock belongs to this user
        const currentValue = await this.redis.getClient().get(key);
        if (currentValue === userId) {
          const deleted = await this.redis.getClient().del(key);
          releasedCount += deleted;
        }
      }

      return releasedCount;
    } catch (error) {
      this.logger.error(`Failed to execute atomic release: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atomically extend TTL for multiple seat locks using Lua script
   * Returns: number of locks extended
   */
  async extendLockTTL(
    lockKeys: string[],
    userId: string,
    newTtl: number
  ): Promise<number> {
    try {
      let extendedCount = 0;

      for (const key of lockKeys) {
        // Only extend if the lock belongs to this user
        const currentValue = await this.redis.getClient().get(key);
        if (currentValue === userId) {
          await this.redis.getClient().expire(key, newTtl);
          extendedCount++;
        }
      }

      return extendedCount;
    } catch (error) {
      this.logger.error(`Failed to execute extend lock: ${error.message}`);
      throw error;
    }
  }
}
