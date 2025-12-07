import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyGrowth = new Map<string, { count: number; admins: number }>();

    users.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      const current = dailyGrowth.get(dateKey) || { count: 0, admins: 0 };
      
      current.count++;
      if (user.role === 'ADMIN') current.admins++;
      
      dailyGrowth.set(dateKey, current);
    });

    const totalUsers = await this.prisma.user.count();

    return {
      totalUsers,
      newUsers: users.length,
      dailyGrowth: Array.from(dailyGrowth.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    };
  }

  async getActivity(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activeUsers = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        userId: true,
        createdAt: true,
      },
    });

    const uniqueUsers = new Set(activeUsers.map((b) => b.userId));

    const topUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return {
      activeUsersCount: uniqueUsers.size,
      totalBookingsInPeriod: activeUsers.length,
      topUsers: topUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        totalBookings: u._count.bookings,
      })),
    };
  }

  async getDemographics() {
    const [totalUsers, byRole, verified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.user.aggregate({
        _count: {
          emailVerified: true,
          phoneVerified: true,
        },
      }),
    ]);

    return {
      totalUsers,
      byRole: byRole.map((r) => ({
        role: r.role,
        count: r._count.id,
      })),
      verificationStats: {
        emailVerified: verified._count.emailVerified,
        phoneVerified: verified._count.phoneVerified,
      },
    };
  }
}
