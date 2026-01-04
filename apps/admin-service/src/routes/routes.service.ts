import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.route.findMany({
      include: {
        stops: {
          include: {
            fromStation: true,
            toStation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            fromStation: true,
            toStation: true,
          },
        },
      },
    });
  }
}
