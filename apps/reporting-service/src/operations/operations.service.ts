import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  async getTrainUtilization() {
    const trains = await this.prisma.train.findMany({
      include: {
        journeys: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
        _count: {
          select: { journeys: true },
        },
      },
    });

    return trains.map((train) => {
      const totalBookings = train.journeys.reduce(
        (sum, j) => sum + j.bookings.length,
        0,
      );

      return {
        trainId: train.id,
        trainName: train.name,
        trainNumber: train.trainNumber,
        totalJourneys: train._count.journeys,
        totalBookings,
        utilizationRate: train._count.journeys > 0 
          ? (totalBookings / train._count.journeys).toFixed(2) 
          : 0,
      };
    });
  }

  async getRoutePerformance() {
    const routes = await this.prisma.route.findMany({
      include: {
        journeys: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
        _count: {
          select: { journeys: true },
        },
      },
    });

    return routes.map((route) => {
      const totalRevenue = route.journeys.reduce(
        (sum, j) =>
          sum +
          j.bookings.reduce((bSum, b) => bSum + b.totalAmount, 0),
        0,
      );

      const totalBookings = route.journeys.reduce(
        (sum, j) => sum + j.bookings.length,
        0,
      );

      return {
        routeId: route.id,
        totalJourneys: route._count.journeys,
        totalBookings,
        totalRevenue,
        averageRevenuePerJourney: route._count.journeys > 0 
          ? (totalRevenue / route._count.journeys).toFixed(2) 
          : 0,
      };
    });
  }

  async getOccupancy() {
    const journeys = await this.prisma.journey.findMany({
      where: {
        journeyDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        train: {
          include: {
            coaches: true,
          },
        },
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            seats: true,
          },
        },
      },
    });

    return journeys.map((journey) => {
      const totalSeats = journey.train.coaches.reduce(
        (sum, coach) => sum + coach.totalSeats,
        0,
      );

      const bookedSeats = journey.bookings.reduce(
        (sum, booking) => sum + booking.seats.length,
        0,
      );

      return {
        journeyId: journey.id,
        trainName: journey.train.name,
        journeyDate: journey.journeyDate,
        totalSeats,
        bookedSeats,
        availableSeats: journey.availableSeats,
        occupancyRate: totalSeats > 0 
          ? ((bookedSeats / totalSeats) * 100).toFixed(2) 
          : 0,
      };
    });
  }
}
