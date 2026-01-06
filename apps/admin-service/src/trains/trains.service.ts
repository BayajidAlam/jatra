import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTrainDto, UpdateTrainDto, QueryTrainsDto } from './dto/train.dto';

@Injectable()
export class TrainsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTrainsDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { trainNumber: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [trains, total] = await Promise.all([
      this.prisma.train.findMany({
        where,
        skip,
        take: limit,
        include: {
          coaches: true,
          _count: {
            select: { coaches: true, journeys: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.train.count({ where }),
    ]);

    return {
      trains,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const train = await this.prisma.train.findUnique({
      where: { id },
      include: {
        journeys: {
          take: 5,
          orderBy: { journeyDate: 'desc' },
        },
      },
    });

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    return train;
  }

  async create(dto: CreateTrainDto) {
    // Check if train number already exists
    const existing = await this.prisma.train.findUnique({
      where: { trainNumber: dto.trainNumber },
    });

    if (existing) {
      throw new ConflictException('Train number already exists');
    }

    const data: any = {
      name: dto.name,
      trainNumber: dto.trainNumber,
    };
    
    if (dto.type) {
      data.type = dto.type;
    }

    return this.prisma.train.create({
      data,
      include: {
        coaches: true,
      },
    });
  }

  async update(id: string, dto: UpdateTrainDto) {
    await this.findOne(id);

    // Check for duplicate train number if being updated
    if (dto.trainNumber) {
      const existing = await this.prisma.train.findFirst({
        where: {
          trainNumber: dto.trainNumber,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Train number already exists');
      }
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.trainNumber !== undefined) data.trainNumber = dto.trainNumber;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.train.update({
      where: { id },
      data,
      include: {
        coaches: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if train has active journeys
    const activeJourneys = await this.prisma.journey.count({
      where: {
        trainId: id,
        status: 'SCHEDULED',
      },
    });

    if (activeJourneys > 0) {
      throw new ConflictException('Cannot delete train with active journeys');
    }

    try {
      await this.prisma.train.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete train because it is referenced by other records (coaches, history, etc.)');
        }
      }
      throw error;
    }

    return { message: 'Train deleted successfully' };
  }
}
