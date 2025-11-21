import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async create(createStationDto: CreateStationDto) {
    return this.prisma.station.create({
      data: createStationDto,
    });
  }

  async findAll() {
    return this.prisma.station.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.station.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.station.findUnique({
      where: { code },
    });
  }

  async findByCity(city: string) {
    return this.prisma.station.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
