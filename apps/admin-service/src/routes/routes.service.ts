import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip, take, search } = params;

    const where: Prisma.RouteWhereInput = search
      ? {
          routeName: { contains: search, mode: 'insensitive' },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        skip,
        take,
        where,
        include: {
          stops: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: skip !== undefined && take ? Math.floor(skip / take) + 1 : 1,
        limit: take,
        totalPages: take ? Math.ceil(total / take) : 1,
      },
    };
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

  async create(data: any) {
    const { stops, ...rest } = data;
    return this.prisma.route.create({
      data: {
        ...rest,
        stops: stops ? {
          create: stops.map((stop: any) => ({
            ...stop,
          })),
        } : undefined,
      },
      include: { stops: true },
    });
  }

  async update(id: string, data: any) {
    const { stops, ...rest } = data;
    // Simple update for now, stops management might require separate logic
    return this.prisma.route.update({
      where: { id },
      data: rest,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.route.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete route because it is referenced by other records (journeys, etc.)');
        }
      }
      throw error;
    }
  }
}
