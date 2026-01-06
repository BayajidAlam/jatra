import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSeatDto, UpdateSeatDto, QuerySeatsDto, BulkCreateSeatsDto } from './dto/seat.dto';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip, take, search } = params;

    const where: Prisma.SeatWhereInput = search
      ? {
          OR: [
            { seatNumber: { contains: search, mode: 'insensitive' } },
            { coach: { coachCode: { contains: search, mode: 'insensitive' } } },
            { coach: { train: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.seat.findMany({
        skip,
        take,
        where,
        include: {
          coach: {
            include: { train: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.seat.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: skip !== undefined && take ? Math.floor(skip / take) + 1 : 1,
        limit: take,
        totalPages: take ? Math.ceil(total / take) : 1,
      },
    };
  }

  async findOne(id: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: {
        coach: {
          include: { train: true },
        },
      },
    });

    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    return seat;
  }

  async create(dto: CreateSeatDto) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: dto.coachId },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const existing = await this.prisma.seat.findFirst({
      where: {
        coachId: dto.coachId,
        seatNumber: dto.seatNumber,
      },
    });

    if (existing) {
      throw new ConflictException('Seat number already exists for this coach');
    }

    return this.prisma.seat.create({
      data: dto,
    });
  }

  async bulkCreate(dto: BulkCreateSeatsDto) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: dto.coachId },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const seatsToCreate = [];
    for (let i = 0; i < dto.count; i++) {
      seatsToCreate.push({
        coachId: dto.coachId,
        seatNumber: `${dto.prefix}${dto.startNumber + i}`,
        seatType: dto.seatType,
        baseFare: dto.baseFare,
      });
    }

    // We use createMany for efficiency
    return this.prisma.seat.createMany({
      data: seatsToCreate,
      skipDuplicates: true,
    });
  }

  async update(id: string, dto: UpdateSeatDto) {
    const seat = await this.findOne(id);

    const targetCoachId = dto.coachId || seat.coachId;

    if (dto.seatNumber || dto.coachId) {
      const targetSeatNumber = dto.seatNumber || seat.seatNumber;
      
      const existing = await this.prisma.seat.findFirst({
        where: {
          coachId: targetCoachId,
          seatNumber: targetSeatNumber,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Seat number already exists for this coach');
      }
    }

    return this.prisma.seat.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if seat is part of any bookings
    const bookingsCount = await this.prisma.bookingsSeat.count({
      where: { seatId: id },
    });

    if (bookingsCount > 0) {
      throw new ConflictException('Cannot delete seat with active bookings');
    }

    await this.prisma.seat.delete({
      where: { id },
    });

    return { message: 'Seat deleted successfully' };
  }
}
