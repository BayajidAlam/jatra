import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { LuaScriptService } from './lua-script.service';
import { AcquireLockDto } from './dto/acquire-lock.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ExtendLockDto } from './dto/extend-lock.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LocksService {
  private readonly logger = new Logger(LocksService.name);
  private readonly lockTTL = parseInt(process.env.LOCK_TTL_SECONDS || '600');

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly luaScript: LuaScriptService,
  ) {}

  async acquireLock(dto: AcquireLockDto) {
    // 1. Validate journey exists
    const journey = await this.prisma.journey.findUnique({
      where: { id: dto.journeyId },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
            },
          },
        },
      },
    });

    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    // 2. Validate seats exist and belong to this train
    const allSeats = journey.train.coaches.flatMap((coach) => coach.seats);
    const requestedSeats = allSeats.filter((seat) => dto.seatIds.includes(seat.id));

    if (requestedSeats.length !== dto.seatIds.length) {
      throw new BadRequestException('One or more seats do not exist or do not belong to this train');
    }

    // 3. Use atomic Lua script to check and lock all seats
    // This prevents race conditions by checking ALL seats first, then locking ALL or NONE
    const lockKeys = dto.seatIds.map(seatId => this.getLockKey(dto.journeyId, seatId));
    const atomicResult = await this.luaScript.atomicLockSeats(
      lockKeys,
      dto.userId,
      this.lockTTL
    );

    if (!atomicResult.success) {
      throw new ConflictException({
        message: 'One or more seats are already locked',
        failedSeat: atomicResult.failedSeat,
      });
    }

    // 4. Check if seats are already confirmed in database
    const confirmedReservations = await this.prisma.reservation.findMany({
      where: {
        journeyId: dto.journeyId,
        status: 'CONFIRMED',
        seatIds: {
          hasSome: dto.seatIds,
        },
      },
    });

    if (confirmedReservations.length > 0) {
      const bookedSeats = confirmedReservations.flatMap((r) =>
        r.seatIds.filter((sId) => dto.seatIds.includes(sId)),
      );
      throw new ConflictException({
        message: 'One or more seats are already booked',
        bookedSeats,
      });
    }

    // 5. Calculate total fare
    const totalFare = requestedSeats.reduce((sum, seat) => sum + seat.baseFare, 0);

    // 6. Generate lock ID
    const lockId = this.generateLockId(dto.userId);
    const lockExpiry = new Date(Date.now() + this.lockTTL * 1000);

    // 7. Locks already acquired atomically by Lua script above
    // No need for individual lock acquisition or rollback logic
    this.logger.log(`Atomic lock acquired for ${dto.seatIds.length} seats: ${atomicResult.lockedSeats?.join(', ')}`);

    // 8. Create reservation record in database
    const reservation = await this.prisma.reservation.create({
      data: {
        userId: dto.userId,
        journeyId: dto.journeyId,
        seatIds: dto.seatIds,
        fromStationId: dto.fromStationId,
        toStationId: dto.toStationId,
        status: 'LOCKED',
        lockExpiry,
        totalFare,
        lockId,
      },
      include: {
        journey: {
          include: {
            train: true,
          },
        },
        fromStation: true,
        toStation: true,
      },
    });

    this.logger.log(`Lock acquired: ${lockId} for ${dto.seatIds.length} seats`);

    return {
      lockId,
      reservationId: reservation.id,
      expiresAt: lockExpiry,
      totalFare,
      seatCount: dto.seatIds.length,
      ttlSeconds: this.lockTTL,
      reservation,
    };
  }

  async checkAvailability(journeyId: string, dto: CheckAvailabilityDto) {
    // Get all seats for the journey's train
    const journey = await this.prisma.journey.findUnique({
      where: { id: journeyId },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
            },
          },
        },
      },
    });

    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    const allSeats = journey.train.coaches.flatMap((coach) =>
      coach.seats.map((seat) => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        coachId: seat.coachId,
        baseFare: seat.baseFare,
      })),
    );

    // Filter by specific seats if provided
    const seatsToCheck = dto.seatIds
      ? allSeats.filter((seat) => dto.seatIds.includes(seat.id))
      : allSeats;

    // Check locked seats in Redis
    const lockedSeats: string[] = [];
    for (const seat of seatsToCheck) {
      const lockKey = this.getLockKey(journeyId, seat.id);
      const lock = await this.redis.checkLock(lockKey);
      if (lock) {
        lockedSeats.push(seat.id);
      }
    }

    // Check confirmed reservations in database
    const confirmedReservations = await this.prisma.reservation.findMany({
      where: {
        journeyId,
        status: 'CONFIRMED',
      },
    });

    const bookedSeats = confirmedReservations.flatMap((r) => r.seatIds);

    // Calculate available seats
    const availableSeats = seatsToCheck.filter(
      (seat) => !lockedSeats.includes(seat.id) && !bookedSeats.includes(seat.id),
    );

    return {
      journeyId,
      totalSeats: seatsToCheck.length,
      availableSeats: availableSeats.map((s) => s.id),
      lockedSeats,
      bookedSeats,
      availableCount: availableSeats.length,
      lockedCount: lockedSeats.length,
      bookedCount: bookedSeats.filter((id) => seatsToCheck.some((s) => s.id === id)).length,
    };
  }

  async extendLock(dto: ExtendLockDto) {
    // Find reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { lockId: dto.lockId },
    });

    if (!reservation) {
      throw new NotFoundException('Lock not found');
    }

    if (reservation.status !== 'LOCKED') {
      throw new BadRequestException('Lock is not in LOCKED status');
    }

    // Check if lock is expired
    if (reservation.lockExpiry < new Date()) {
      throw new BadRequestException('Lock has already expired');
    }

    // Extend locks in Redis using atomic Lua script
    const lockKeys = reservation.seatIds.map(seatId => 
      this.getLockKey(reservation.journeyId, seatId)
    );
    const extendedCount = await this.luaScript.extendLockTTL(
      lockKeys,
      reservation.userId,
      dto.extensionSeconds
    );
    const extended = extendedCount === reservation.seatIds.length;

    // Update database
    const newExpiry = new Date(reservation.lockExpiry.getTime() + dto.extensionSeconds * 1000);
    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { lockExpiry: newExpiry },
    });

    this.logger.log(`Lock extended: ${dto.lockId} by ${dto.extensionSeconds}s`);

    return {
      success: true,
      lockId: dto.lockId,
      newExpiresAt: newExpiry,
      extendedSeconds: dto.extensionSeconds,
      redisExtended: extended,
    };
  }

  async releaseLock(lockId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { lockId },
    });

    if (!reservation) {
      throw new NotFoundException('Lock not found');
    }

    if (reservation.status !== 'LOCKED') {
      throw new BadRequestException('Lock is not in LOCKED status');
    }

    // Release locks in Redis using atomic Lua script
    const lockKeys = reservation.seatIds.map(seatId => 
      this.getLockKey(reservation.journeyId, seatId)
    );
    const releasedCount = await this.luaScript.atomicReleaseSeats(
      lockKeys,
      reservation.userId
    );
    const releasedSeats = releasedCount === reservation.seatIds.length 
      ? reservation.seatIds 
      : [];

    // Update reservation status
    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'RELEASED' },
    });

    this.logger.log(`Lock released: ${lockId}, ${releasedSeats.length} seats`);

    return {
      success: true,
      lockId,
      releasedSeats,
      reservationId: reservation.id,
    };
  }

  async getUserLocks(userId: string) {
    const locks = await this.prisma.reservation.findMany({
      where: {
        userId,
        status: 'LOCKED',
        lockExpiry: {
          gt: new Date(),
        },
      },
      include: {
        journey: {
          include: {
            train: true,
          },
        },
        fromStation: true,
        toStation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      userId,
      activeLocks: locks.length,
      locks,
    };
  }

  // Cron job to clean expired locks every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredLocks() {
    const expiredReservations = await this.prisma.reservation.findMany({
      where: {
        status: 'LOCKED',
        lockExpiry: {
          lt: new Date(),
        },
      },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    this.logger.log(`Cleaning up ${expiredReservations.length} expired locks`);

    for (const reservation of expiredReservations) {
      // Remove from Redis
      for (const seatId of reservation.seatIds) {
        const lockKey = this.getLockKey(reservation.journeyId, seatId);
        await this.redis.releaseLock(lockKey);
      }

      // Update status
      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'EXPIRED' },
      });
    }

    this.logger.log(`Cleaned up ${expiredReservations.length} expired locks`);
  }

  // Helper methods
  private getLockKey(journeyId: string, seatId: string): string {
    return `seat:lock:${journeyId}:${seatId}`;
  }

  private generateLockId(userId: string): string {
    const timestamp = Date.now();
    const userPrefix = userId.substring(0, 8);
    return `lock_${timestamp}_${userPrefix}`;
  }

  private async rollbackLocks(journeyId: string, seatIds: string[]): Promise<void> {
    for (const seatId of seatIds) {
      const lockKey = this.getLockKey(journeyId, seatId);
      await this.redis.releaseLock(lockKey);
    }
  }
}
