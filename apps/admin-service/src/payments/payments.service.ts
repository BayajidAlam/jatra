import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PaymentWhereUniqueInput;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          booking: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        total,
        page: skip / take + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            journey: {
              include: {
                train: true,
                route: true,
              },
            },
          },
        },
      },
    });
  }

  async getStats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
        successful, 
        pending, 
        refunded, 
        failed,
        // Trends (Last 7 days vs Previous 7 days)
        successfulCurrent, successfulPrevious,
        pendingCurrent, pendingPrevious,
        refundedCurrent, refundedPrevious,
        failedCurrent, failedPrevious
    ] = await Promise.all([
      // Totals
      this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({ where: { status: 'REFUNDED' }, _sum: { amount: true } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),

      // Trend Data - Successful
      this.prisma.payment.aggregate({ 
          where: { status: 'COMPLETED', createdAt: { gte: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),
      this.prisma.payment.aggregate({ 
          where: { status: 'COMPLETED', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),

      // Trend Data - Pending
       this.prisma.payment.aggregate({ 
          where: { status: 'PENDING', createdAt: { gte: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),
      this.prisma.payment.aggregate({ 
          where: { status: 'PENDING', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),

      // Trend Data - Refunded
      this.prisma.payment.aggregate({ 
          where: { status: 'REFUNDED', createdAt: { gte: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),
      this.prisma.payment.aggregate({ 
          where: { status: 'REFUNDED', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }, 
          _sum: { amount: true } 
      }),

       // Trend Data - Failed (Count)
       this.prisma.payment.count({ where: { status: 'FAILED', createdAt: { gte: sevenDaysAgo } } }),
       this.prisma.payment.count({ where: { status: 'FAILED', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return {
      successfulAmount: successful._sum.amount || 0,
      successfulGrowth: calculateGrowth(successfulCurrent._sum.amount || 0, successfulPrevious._sum.amount || 0).toFixed(1),
      
      pendingAmount: pending._sum.amount || 0,
      pendingGrowth: calculateGrowth(pendingCurrent._sum.amount || 0, pendingPrevious._sum.amount || 0).toFixed(1),

      refundedAmount: refunded._sum.amount || 0,
      refundedGrowth: calculateGrowth(refundedCurrent._sum.amount || 0, refundedPrevious._sum.amount || 0).toFixed(1),

      failedCount: failed,
      failedGrowth: calculateGrowth(failedCurrent, failedPrevious).toFixed(1),
    };
  }
}
