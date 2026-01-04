import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  private cache: { data: any; timestamp: number } | null = null;
  private readonly CACHE_TTL = 60 * 1000; // 60 seconds

  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    // Simple in-memory caching strategy
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Dates for Trends
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalTrains,
      totalBookings,
      revenueStats,
      activeTrains,
      recentBookings,
      dailyRevenue,
      hourlyTraffic,
      // Trend Data
      currentMonthRevenue,
      previousMonthRevenue,
      currentMonthBookings,
      previousMonthBookings,
      currentMonthUsers,
      previousMonthUsers
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.train.count(),
      this.prisma.booking.count(),
      this.prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED },
        _sum: { totalAmount: true },
      }),
      this.prisma.journey.count({
        where: {
          journeyDate: { equals: today },
          status: 'SCHEDULED'
        }
      }),
      this.prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          journey: {
            include: {
              train: { select: { name: true, trainNumber: true } },
              route: { select: { routeName: true } }
            }
          },
          payment: { select: { status: true, amount: true } }
        }
      }),
      this.getRevenueChartData(),
      this.getHourlyTrafficData(today),
      // Revenue Trends
      this.prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED, createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true }
      }),
      this.prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { totalAmount: true }
      }),
      // Booking Trends
      this.prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      // User Trends
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calculateGrowth(currentMonthRevenue._sum.totalAmount || 0, previousMonthRevenue._sum.totalAmount || 0);
    const bookingGrowth = calculateGrowth(currentMonthBookings, previousMonthBookings);
    const userGrowth = calculateGrowth(currentMonthUsers, previousMonthUsers);

    const data = {
      overview: {
        totalRevenue: revenueStats._sum.totalAmount || 0,
        revenueGrowth: revenueGrowth.toFixed(1),
        totalBookings,
        bookingGrowth: bookingGrowth.toFixed(1),
        activeTrains,
        totalUsers,
        userGrowth: userGrowth.toFixed(1),
      },
      charts: {
        revenue: dailyRevenue,
        traffic: hourlyTraffic
      },
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        bookingId: b.id.slice(0, 8).toUpperCase(), 
        passengerName: b.user.name,
        trainName: b.journey.train.name,
        route: b.journey.route.routeName,
        amount: b.totalAmount,
        status: b.status,
        paymentStatus: b.payment?.status || 'PENDING',
        createdAt: b.createdAt
      }))
    };

    this.cache = { data, timestamp: Date.now() };
    return data;
  }

  private async getRevenueChartData() {
    const days = 7;
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const result = await this.prisma.booking.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: BookingStatus.CONFIRMED
        },
        _sum: { totalAmount: true }
      });

      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: result._sum.totalAmount || 0
      });
    }
    return data;
  }

  private async getHourlyTrafficData(date: Date) {
    // This is expensive to do exactly via group by on timestamp without raw query
    // For MVP, we'll fetch today's bookings and group in JS (assuming reasonable volume)
    // Or simpler: count for specific key hours (6am, 9am, 12pm, etc.)
    
    // Using simple ranges for key hours to populate the chart
    const hours = [6, 9, 12, 15, 18, 21];
    const data = [];

    for (const hour of hours) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 2, 59, 59, 999); // 3 hour block

      const count = await this.prisma.booking.count({
        where: {
          createdAt: { gte: start, lt: end }
        }
      });

      data.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        visitors: count 
      });
    }
    return data;
  }

  async getPaymentStats() {
      const [successful, pending, refunded, failed] = await Promise.all([
          this.prisma.payment.aggregate({
              where: { status: PaymentStatus.COMPLETED },
              _sum: { amount: true }
          }),
          this.prisma.payment.aggregate({
              where: { status: PaymentStatus.PENDING },
              _sum: { amount: true }
          }),
          this.prisma.payment.aggregate({
            where: { status: PaymentStatus.REFUNDED },
            _sum: { amount: true }
        }),
        this.prisma.payment.count({
            where: { status: PaymentStatus.FAILED }
        })
      ]);

      return {
          successfulAmount: successful._sum.amount || 0,
          pendingAmount: pending._sum.amount || 0,
          refundedAmount: refunded._sum.amount || 0,
          failedCount: failed
      };
  }
}
