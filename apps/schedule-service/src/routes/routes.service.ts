import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateRouteDto } from "./dto/create-route.dto";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(createRouteDto: CreateRouteDto) {
    const { routeName, totalDistance, isActive, stops } = createRouteDto;

    // Check if route with same name already exists
    const existingRoute = await this.prisma.route.findFirst({
      where: { routeName },
    });

    if (existingRoute) {
      throw new ConflictException(
        `Route with name ${routeName} already exists`
      );
    }

    // Validate all stations exist
    const stationIds = new Set<string>();
    stops.forEach((stop) => {
      stationIds.add(stop.fromStationId);
      stationIds.add(stop.toStationId);
    });

    const stations = await this.prisma.station.findMany({
      where: { id: { in: Array.from(stationIds) } },
    });

    if (stations.length !== stationIds.size) {
      throw new NotFoundException("One or more stations not found");
    }

    // Validate stop orders are sequential
    const orders = stops.map((s) => s.stopOrder).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new BadRequestException(
          "Stop orders must be sequential starting from 1"
        );
      }
    }

    try {
      return await this.prisma.route.create({
        data: {
          routeName,
          totalDistance,
          isActive: isActive ?? true,
          stops: {
            create: stops.map((stop) => ({
              fromStationId: stop.fromStationId,
              toStationId: stop.toStationId,
              stopOrder: stop.stopOrder,
              distanceFromStart: stop.distanceFromStart,
              durationMinutes: stop.durationMinutes,
            })),
          },
        },
        include: {
          stops: {
            include: {
              fromStation: true,
              toStation: true,
            },
            orderBy: {
              stopOrder: "asc",
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Route with these details already exists"
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.route.findMany({
      where: { isActive: true },
      include: {
        stops: {
          include: {
            fromStation: true,
            toStation: true,
          },
          orderBy: {
            stopOrder: "asc",
          },
        },
      },
      orderBy: { routeName: "asc" },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            fromStation: true,
            toStation: true,
          },
          orderBy: {
            stopOrder: "asc",
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  async findByName(routeName: string) {
    return this.prisma.route.findMany({
      where: {
        routeName: {
          contains: routeName,
          mode: "insensitive",
        },
        isActive: true,
      },
      include: {
        stops: {
          include: {
            fromStation: true,
            toStation: true,
          },
          orderBy: {
            stopOrder: "asc",
          },
        },
      },
    });
  }
}
