import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { RabbitMQService } from '../common/rabbitmq.service';

@Injectable()
export class JourneysService {
  constructor(
    private prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService
  ) {}

  // ... (findAll and findOne remain same, skipping to save context if possible, but replace_file_content needs context)
  // actually I can't skip deeply nested code in replace, I'll target the class start and methods I change.

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
      include: { coaches: true }, 
    });

    if (!train) {
      throw new Error('Train not found');
    }

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
    // Get old journey to compare
    const oldJourney = await this.prisma.journey.findUnique({
        where: { id },
        include: { train: true }
    });

    const updatedJourney = await this.prisma.journey.update({
      where: { id },
      data,
      include: { train: true }
    });

    // Check for delay (Departure time changed)
    if (oldJourney && data.departureTime && new Date(data.departureTime).getTime() !== new Date(oldJourney.departureTime).getTime()) {
        const oldTime = new Date(oldJourney.departureTime);
        const newTime = new Date(data.departureTime);
        const diffMs = newTime.getTime() - oldTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins > 0) { // Only if delayed
            await this.rabbitMQ.publishTrainUpdate({
                journeyId: id,
                trainId: updatedJourney.trainId,
                trainName: updatedJourney.train.name,
                trainNumber: updatedJourney.train.trainNumber,
                updateType: 'DELAY',
                delayMinutes: diffMins,
                newDepartureTime: newTime,
                reason: data.metadata?.reason || "Operational Delay" 
            });
        }
    }
    
    // Check for Cancellation (Status changed to CANCELLED - assuming status field exists or isActive)
    // If schema has status... let's check schema. Assuming isActive for now or if we add status later.
    // For now the prompt specifically asked for "Delay".

    return updatedJourney;
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
