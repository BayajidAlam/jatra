import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateTrainDto } from "./dto/create-train.dto";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class TrainsService {
  constructor(private prisma: PrismaService) {}

  async create(createTrainDto: CreateTrainDto) {
    // Check if train number already exists
    const existingTrain = await this.prisma.train.findUnique({
      where: { trainNumber: createTrainDto.trainNumber },
    });

    if (existingTrain) {
      throw new ConflictException(
        `Train with number ${createTrainDto.trainNumber} already exists`
      );
    }

    try {
      return await this.prisma.train.create({
        data: createTrainDto,
      });
    } catch (error) {
      // Handle any other Prisma unique constraint errors
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            `Train with this ${error.meta?.target} already exists`
          );
        }
      }
      throw error;
    }
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
      orderBy: { name: "asc" },
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
