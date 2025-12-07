import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async getSummary(startDate?: Date, endDate?: Date) {
    const where: any = { status: 'CONFIRMED' };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [bookings, payments, refunds] = await Promise.all([
      this.prisma.booking.aggregate({
        where,
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.booking.aggregate({
        where: { status: 'CANCELLED' },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRevenue: bookings._sum.totalAmount || 0,
      totalPayments: payments._sum.amount || 0,
      totalRefunds: refunds._sum.totalAmount || 0,
      netRevenue: (bookings._sum.totalAmount || 0) - (refunds._sum.totalAmount || 0),
      bookingCount: bookings._count.id,
      paymentCount: payments._count.id,
      refundCount: refunds._count.id,
    };
  }

  async getByRoute() {
    const routes = await this.prisma.route.findMany({
      include: {
        journeys: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    return routes.map((route) => {
      const revenue = route.journeys.reduce(
        (sum, j) =>
          sum + j.bookings.reduce((bSum, b) => bSum + b.totalAmount, 0),
        0,
      );

      const bookingCount = route.journeys.reduce(
        (sum, j) => sum + j.bookings.length,
        0,
      );

      return {
        routeId: route.id,
        revenue,
        bookingCount,
        averageBookingValue: bookingCount > 0 ? revenue / bookingCount : 0,
      };
    });
  }

  async getByTrain() {
    const trains = await this.prisma.train.findMany({
      include: {
        journeys: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    return trains.map((train) => {
      const revenue = train.journeys.reduce(
        (sum, j) =>
          sum + j.bookings.reduce((bSum, b) => bSum + b.totalAmount, 0),
        0,
      );

      const bookingCount = train.journeys.reduce(
        (sum, j) => sum + j.bookings.length,
        0,
      );

      return {
        trainId: train.id,
        trainName: train.name,
        trainNumber: train.trainNumber,
        revenue,
        bookingCount,
        averageBookingValue: bookingCount > 0 ? revenue / bookingCount : 0,
      };
    });
  }
}
