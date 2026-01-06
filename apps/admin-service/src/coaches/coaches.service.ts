import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCoachDto, UpdateCoachDto, QueryCoachesDto } from './dto/coach.dto';

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip, take, search } = params;

    const where: Prisma.CoachWhereInput = search
      ? {
          OR: [
            { coachCode: { contains: search, mode: 'insensitive' } },
            { train: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.coach.findMany({
        skip,
        take,
        where,
        include: { train: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coach.count({ where }),
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
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: {
        train: true,
        seats: true,
      },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return coach;
  }

  async create(dto: CreateCoachDto) {
    // Check if train exists
    const train = await this.prisma.train.findUnique({
      where: { id: dto.trainId },
    });

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    // Check if coach code already exists for this train
    const existing = await this.prisma.coach.findFirst({
      where: {
        trainId: dto.trainId,
        coachCode: dto.coachCode,
      },
    });

    if (existing) {
      throw new ConflictException('Coach code already exists for this train');
    }

    return this.prisma.coach.create({
      data: dto,
      include: {
        train: true,
      },
    });
  }

  async update(id: string, dto: UpdateCoachDto) {
    const coach = await this.findOne(id);

    const targetTrainId = dto.trainId || coach.trainId;

    if (dto.coachCode || dto.trainId) {
      const targetCoachCode = dto.coachCode || coach.coachCode;
      
      const existing = await this.prisma.coach.findFirst({
        where: {
          trainId: targetTrainId,
          coachCode: targetCoachCode,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Coach code already exists for this train');
      }
    }

    return this.prisma.coach.update({
      where: { id },
      data: dto,
      include: {
        train: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.coach.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete coach because it is referenced by other records (seats, etc.)');
        }
      }
      throw error;
    }

    return { message: 'Coach deleted successfully' };
  }
}
