import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSeatDto, UpdateSeatDto, QuerySeatsDto, BulkCreateSeatsDto } from './dto/seat.dto';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySeatsDto) {
    const { page = 1, limit = 20, coachId } = query;
    const skip = (page - 1) * limit;

    const where = coachId ? { coachId } : {};

    const [seats, total] = await Promise.all([
      this.prisma.seat.findMany({
        where,
        skip,
        take: limit,
        include: {
          coach: {
            include: { train: true },
          },
        },
        orderBy: { seatNumber: 'asc' },
      }),
      this.prisma.seat.count({ where }),
    ]);

    return {
      seats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

    if (dto.seatNumber) {
      const existing = await this.prisma.seat.findFirst({
        where: {
          coachId: seat.coachId,
          seatNumber: dto.seatNumber,
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
