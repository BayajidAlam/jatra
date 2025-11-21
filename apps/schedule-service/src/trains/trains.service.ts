import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTrainDto } from './dto/create-train.dto';

@Injectable()
export class TrainsService {
  constructor(private prisma: PrismaService) {}

  async create(createTrainDto: CreateTrainDto) {
    return this.prisma.train.create({
      data: createTrainDto,
    });
  }

  async findAll() {
    return this.prisma.train.findMany({
      where: { isActive: true },
      include: {
        coaches: {
          include: {
            seats: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.train.findUnique({
      where: { id },
      include: {
        coaches: {
          include: {
            seats: true,
          },
        },
        journeys: {
          where: {
            journeyDate: {
              gte: new Date(),
            },
          },
          include: {
            route: {
              include: {
                stops: {
                  include: {
                    fromStation: true,
                    toStation: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByTrainNumber(trainNumber: string) {
    return this.prisma.train.findUnique({
      where: { trainNumber },
      include: {
        coaches: {
          include: {
            seats: true,
          },
        },
      },
    });
  }
}
