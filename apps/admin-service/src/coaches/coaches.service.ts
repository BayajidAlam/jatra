import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCoachDto, UpdateCoachDto, QueryCoachesDto } from './dto/coach.dto';

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCoachesDto) {
    const { page = 1, limit = 20, trainId } = query;
    const skip = (page - 1) * limit;

    const where = trainId ? { trainId } : {};

    const [coaches, total] = await Promise.all([
      this.prisma.coach.findMany({
        where,
        skip,
        take: limit,
        include: {
          train: true,
          _count: {
            select: { seats: true },
          },
        },
        orderBy: { coachCode: 'asc' },
      }),
      this.prisma.coach.count({ where }),
    ]);

    return {
      coaches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

    if (dto.coachCode) {
      const existing = await this.prisma.coach.findFirst({
        where: {
          trainId: coach.trainId,
          coachCode: dto.coachCode,
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

    // Check if coach has active journeys (via train)
    // In a real system, we might want more complex checks, but for now we'll allow it if the user is careful.
    // Or we could check if there are any upcoming journeys for the train this coach belongs to.
    
    await this.prisma.coach.delete({
      where: { id },
    });

    return { message: 'Coach deleted successfully' };
  }
}
