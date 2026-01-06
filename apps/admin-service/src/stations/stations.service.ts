import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip, take, search } = params;
    
    const where: Prisma.StationWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.station.findMany({
        skip,
        take,
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.station.count({ where }),
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

  async create(data: any) {
    return this.prisma.station.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.station.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.station.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.station.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete station because it is referenced by other records (routes, stops, etc.)');
        }
      }
      throw error;
    }
  }
}
