import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import { NotificationStatus } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        content: data.content,
        metadata: data.metadata,
        status: NotificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getNotifications(userId: string, query: QueryNotificationsDto) {
    const { type, status, fromDate, toDate, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNotificationById(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async updateNotificationStatus(
    id: number,
    status: NotificationStatus,
    error: string | null = null,
    retryCount?: number
  ) {
    const data: any = { status, error };

    if (status === NotificationStatus.SENT) {
      data.sentAt = new Date();
    }

    if (retryCount !== undefined) {
      data.retryCount = retryCount;
    }

    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async getUserNotificationStats(userId: string) {
    const [total, sent, failed, pending] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({
        where: { userId, status: NotificationStatus.SENT },
      }),
      this.prisma.notification.count({
        where: { userId, status: NotificationStatus.FAILED },
      }),
      this.prisma.notification.count({
        where: { userId, status: NotificationStatus.PENDING },
      }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      retrying: total - sent - failed - pending,
    };
  }
}
