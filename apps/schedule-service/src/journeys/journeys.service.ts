import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchJourneysDto } from './dto/search-journeys.dto';

@Injectable()
export class JourneysService {
  constructor(private prisma: PrismaService) {}

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
            stopOrder: 'asc',
          },
        },
      },
    });

    // Filter routes that have both stations in correct order
    const validRoutes = routes.filter((route) => {
      const fromStopIndex = route.stops.findIndex(
        (stop) =>
          stop.fromStationId === fromStation.id ||
          stop.toStationId === fromStation.id,
      );
      const toStopIndex = route.stops.findIndex(
        (stop) =>
          stop.fromStationId === toStation.id ||
          stop.toStationId === toStation.id,
      );
      return fromStopIndex !== -1 && toStopIndex !== -1 && fromStopIndex < toStopIndex;
    });

    const routeIds = validRoutes.map((r) => r.id);

    // Find journeys for these routes on the given date
    const journeys = await this.prisma.journey.findMany({
      where: {
        routeId: { in: routeIds },
        journeyDate,
        status: { in: ['SCHEDULED', 'DELAYED'] },
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
                stopOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
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
                stopOrder: 'asc',
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
                stopOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    });
  }
}
