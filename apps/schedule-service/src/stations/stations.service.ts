import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateStationDto } from "./dto/create-station.dto";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async create(createStationDto: CreateStationDto) {
    // Check if station code already exists
    const existingStation = await this.prisma.station.findUnique({
      where: { code: createStationDto.code },
    });

    if (existingStation) {
      throw new ConflictException(
        `Station with code ${createStationDto.code} already exists`
      );
    }

    try {
      return await this.prisma.station.create({
        data: createStationDto,
      });
    } catch (error) {
      // Handle any other Prisma unique constraint errors
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            `Station with this ${error.meta?.target} already exists`
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.station.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
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
          mode: "insensitive",
        },
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
  }
}
