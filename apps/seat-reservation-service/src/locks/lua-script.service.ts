import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../common/redis.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LuaScriptService implements OnModuleInit {
  private readonly logger = new Logger(LuaScriptService.name);
  private atomicLockScript: string;
  private atomicReleaseScript: string;
  private extendLockScript: string;

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    // Load Lua scripts
    this.atomicLockScript = fs.readFileSync(
      path.join(__dirname, "scripts", "atomic-lock.lua"),
      "utf8"
    );
    this.atomicReleaseScript = fs.readFileSync(
      path.join(__dirname, "scripts", "atomic-release.lua"),
      "utf8"
    );
    this.extendLockScript = fs.readFileSync(
      path.join(__dirname, "scripts", "extend-lock.lua"),
      "utf8"
    );
    this.logger.log("Lua scripts loaded successfully");
  }

  /**
   * Atomically lock multiple seats using Lua script
   * Returns: { success: boolean, lockedSeats?: string[], failedSeat?: string }
   */
  async atomicLockSeats(
    journeyId: string,
    userId: string,
    seatIds: string[],
    ttl: number
  ): Promise<{
    success: boolean;
    lockedSeats?: string[];
    failedSeat?: string;
  }> {
    try {
      const result = await this.redis.getClient().eval(
        this.atomicLockScript,
        0, // No keys, only arguments
        journeyId,
        userId,
        ttl.toString(),
        seatIds.length.toString(),
        ...seatIds
      );

      // Result format: [success, data]
      // If success=1: [1, "seat1,seat2,seat3"]
      // If success=0: [0, "failedSeatId"]
      const [success, data] = result as [number, string];

      if (success === 1) {
        return {
          success: true,
          lockedSeats: data.split(","),
        };
      } else {
        return {
          success: false,
          failedSeat: data,
        };
      }
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
    journeyId: string,
    userId: string,
    seatIds: string[]
  ): Promise<number> {
    try {
      const releasedCount = await this.redis
        .getClient()
        .eval(
          this.atomicReleaseScript,
          0,
          journeyId,
          userId,
          seatIds.length.toString(),
          ...seatIds
        );

      return releasedCount as number;
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
    journeyId: string,
    userId: string,
    seatIds: string[],
    newTtl: number
  ): Promise<number> {
    try {
      const extendedCount = await this.redis
        .getClient()
        .eval(
          this.extendLockScript,
          0,
          journeyId,
          userId,
          newTtl.toString(),
          seatIds.length.toString(),
          ...seatIds
        );

      return extendedCount as number;
    } catch (error) {
      this.logger.error(`Failed to execute extend lock: ${error.message}`);
      throw error;
    }
  }
}
