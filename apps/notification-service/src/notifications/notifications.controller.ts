import { Controller, Get, Post, Param, Query, ParseIntPipe, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { EmailService } from '../email/email.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification manually (for testing)' })
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiParam({ name: 'userId', type: 'number' })
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.getNotifications(userId, query);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get notification statistics for a user' })
  @ApiParam({ name: 'userId', type: 'number' })
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUserNotificationStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async getNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.getNotificationById(id);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend a failed notification' })
  @ApiParam({ name: 'id', type: 'number' })
  async resendNotification(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.getNotificationById(id);

    // Extract template name from notification type
    const templateMap = {
      BOOKING_CONFIRMED: 'booking-confirmed',
      BOOKING_CANCELLED: 'booking-cancelled',
      PAYMENT_FAILED: 'payment-failed',
    };

    const template = templateMap[notification.type];
    if (!template) {
      throw new Error(`No template found for notification type: ${notification.type}`);
    }

    await this.emailService.sendEmail(
      notification.user.email,
      notification.subject,
      template,
      notification.metadata || {},
      notification.id,
    );

    return { message: 'Notification resent successfully' };
  }
}
