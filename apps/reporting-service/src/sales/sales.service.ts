import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getRevenue(startDate?: Date, endDate?: Date) {
    const where: any = { status: 'CONFIRMED' };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalRevenue, bookingCount, paymentMethods] = await Promise.all([
      this.prisma.booking.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.count({ where }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      bookingCount,
      averageBookingValue: bookingCount > 0 
        ? (totalRevenue._sum.totalAmount || 0) / bookingCount 
        : 0,
      paymentMethods: paymentMethods.map((pm) => ({
        method: pm.paymentMethod,
        total: pm._sum.amount || 0,
        count: pm._count.id,
      })),
    };
  }

  async getBookingStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return bookingsByStatus.map((b) => ({
      status: b.status,
      count: b._count.id,
      revenue: b._sum.totalAmount || 0,
    }));
  }

  async getTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyStats = new Map<string, { count: number; revenue: number }>();

    bookings.forEach((booking) => {
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      const current = dailyStats.get(dateKey) || { count: 0, revenue: 0 };
      
      current.count++;
      if (booking.status === 'CONFIRMED') {
        current.revenue += booking.totalAmount;
      }
      
      dailyStats.set(dateKey, current);
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }
}
