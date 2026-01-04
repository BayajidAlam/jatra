import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JourneysService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.JourneyWhereInput = search
      ? {
          OR: [
            { train: { name: { contains: search, mode: 'insensitive' } } },
            { train: { trainNumber: { contains: search, mode: 'insensitive' } } },
            { route: { routeName: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [journeys, total] = await Promise.all([
      this.prisma.journey.findMany({
        skip,
        take: limit,
        where,
        include: {
          train: true,
          route: true,
        },
        orderBy: { journeyDate: 'desc' },
      }),
      this.prisma.journey.count({ where }),
    ]);

    return {
      journeys,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.journey.findUnique({
      where: { id },
      include: {
        train: true,
        route: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: any) {
    // Fetch train to get total seats
    const train = await this.prisma.train.findUnique({
      where: { id: data.trainId },
      include: { coaches: true }, // Assuming coaches have seats or totalSeats field
    });

    if (!train) {
      throw new Error('Train not found');
    }

    // Calculate total seats from coaches if stored there, or use train.totalSeats if aggregated
    // The previous summary mentioned adding totalSeats to TrainDto, let's assume Train model has it or calculate.
    // Schema Check: Train model doesn't have totalSeats in provided schema snippet (Step 843)!
    // Wait, Step 843 (Schema):
    // model Train { ... id, trainNumber, name, type, isActive ... coaches Coach[] ... }
    // model Coach { ... totalSeats Int ... }
    // So distinct seat count = sum of coach.totalSeats
    
    let totalSeats = 0;
    if (train.coaches) {
      totalSeats = train.coaches.reduce((sum, coach) => sum + coach.totalSeats, 0);
    }

    return this.prisma.journey.create({
      data: {
        ...data,
        totalSeats,
        availableSeats: totalSeats,
      },
      include: { train: true, route: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.journey.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.journey.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete journey because it has existing bookings or is referenced by other records.');
        }
      }
      throw error;
    }
  }
}
