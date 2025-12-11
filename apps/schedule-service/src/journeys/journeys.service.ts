import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SearchJourneysDto } from "./dto/search-journeys.dto";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class JourneysService {
  constructor(private prisma: PrismaService) {}

  async create(createJourneyDto: CreateJourneyDto) {
    const {
      trainId,
      routeId,
      departureTime,
      arrivalTime,
      journeyDate,
      status,
      totalSeats,
      availableSeats,
    } = createJourneyDto;

    // Validate train exists
    const train = await this.prisma.train.findUnique({
      where: { id: trainId },
    });
    if (!train) {
      throw new NotFoundException(`Train with ID ${trainId} not found`);
    }

    // Validate route exists
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    // Validate availableSeats <= totalSeats
    if (availableSeats > totalSeats) {
      throw new BadRequestException(
        "Available seats cannot exceed total seats"
      );
    }

    // Validate departure time is before arrival time
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    if (departure >= arrival) {
      throw new BadRequestException(
        "Departure time must be before arrival time"
      );
    }

    // Check for duplicate journey (same train, route, and date)
    const existingJourney = await this.prisma.journey.findFirst({
      where: {
        trainId,
        routeId,
        journeyDate: new Date(journeyDate),
      },
    });

    if (existingJourney) {
      throw new ConflictException(
        `Journey already exists for train ${train.name} on route ${route.name} for date ${journeyDate}`
      );
    }

    try {
      return await this.prisma.journey.create({
        data: {
          trainId,
          routeId,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
          journeyDate: new Date(journeyDate),
          status: status || "SCHEDULED",
          totalSeats,
          availableSeats,
        },
        include: {
          train: true,
          route: {
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
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Journey with these details already exists"
          );
        }
      }
      throw error;
    }
  }

  async searchJourneys(searchDto: SearchJourneysDto) {
    const { from, to, date, trainType } = searchDto;
    const journeyDate = new Date(date);

    // Find stations by code
    const [fromStation, toStation] = await Promise.all([
      this.prisma.station.findUnique({ where: { code: from } }),
      this.prisma.station.findUnique({ where: { code: to } }),
    ]);

    if (!fromStation || !toStation) {
      return [];
    }

    // Find routes that connect these stations
    const routes = await this.prisma.route.findMany({
      where: {
        isActive: true,
        stops: {
          some: {
            OR: [
              { fromStationId: fromStation.id },
              { toStationId: fromStation.id },
            ],
          },
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

    // Filter routes that have both stations in correct order
    const validRoutes = routes.filter((route) => {
      const fromStopIndex = route.stops.findIndex(
        (stop) =>
          stop.fromStationId === fromStation.id ||
          stop.toStationId === fromStation.id
      );
      const toStopIndex = route.stops.findIndex(
        (stop) =>
          stop.fromStationId === toStation.id ||
          stop.toStationId === toStation.id
      );
      return (
        fromStopIndex !== -1 &&
        toStopIndex !== -1 &&
        fromStopIndex < toStopIndex
      );
    });

    const routeIds = validRoutes.map((r) => r.id);

    // Find journeys for these routes on the given date
    const journeys = await this.prisma.journey.findMany({
      where: {
        routeId: { in: routeIds },
        journeyDate,
        status: { in: ["SCHEDULED", "DELAYED"] },
        ...(trainType && {
          train: {
            type: trainType as any,
          },
        }),
      },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
            },
          },
        },
        route: {
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
        },
      },
      orderBy: {
        departureTime: "asc",
      },
    });

    return journeys;
  }

  async findOne(id: string) {
    return this.prisma.journey.findUnique({
      where: { id },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
            },
          },
        },
        route: {
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
        },
      },
    });
  }

  async findByTrainId(trainId: string, fromDate?: string) {
    const dateFilter = fromDate
      ? { gte: new Date(fromDate) }
      : { gte: new Date() };

    return this.prisma.journey.findMany({
      where: {
        trainId,
        journeyDate: dateFilter,
      },
      include: {
        train: true,
        route: {
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
        },
      },
      orderBy: {
        departureTime: "asc",
      },
    });
  }
}
