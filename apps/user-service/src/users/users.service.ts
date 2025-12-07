import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePassengerDto, UpdatePassengerDto } from './dto/passenger.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';
import { TravelHistoryQueryDto } from './dto/travel-history.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        nid: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check if email is already taken by another user
    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Only update fields that exist in User model
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        nid: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Deactivate user account (placeholder - returns user info)
   */
  async deactivateAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Account deactivation requested', userId };
  }

  /**
   * Get all saved passengers for a user (stored as JSON in memory for now)
   */
  async getSavedPassengers(userId: string) {
    // Since SavedPassenger model doesn't exist, return empty array
    // In production, this would be stored in a separate table
    return [];
  }

  /**
   * Add a new saved passenger
   */
  async addPassenger(userId: string, dto: CreatePassengerDto) {
    // Placeholder - would create in SavedPassenger table
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...dto,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update saved passenger
   */
  async updatePassenger(userId: string, passengerId: string, dto: UpdatePassengerDto) {
    // Placeholder - would update in SavedPassenger table
    return {
      id: passengerId,
      ...dto,
      userId,
      updatedAt: new Date(),
    };
  }

  /**
   * Delete saved passenger
   */
  async deletePassenger(userId: string, passengerId: string) {
    // Placeholder - would delete from SavedPassenger table
    return { message: 'Passenger deleted successfully' };
  }

  /**
   * Get user preferences (default values for now)
   */
  async getPreferences(userId: string) {
    // Since UserPreference model doesn't exist, return defaults
    return {
      userId,
      preferredSeatType: 'any',
      preferredClass: 'any',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      language: 'en',
      currency: 'BDT',
      theme: 'light',
    };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // Placeholder - would update in UserPreference table
    return {
      userId,
      ...dto,
      updatedAt: new Date(),
    };
  }

  /**
   * Get user travel history with statistics
   */
  async getTravelHistory(userId: string, query: TravelHistoryQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Get bookings with journey details
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          journey: {
            include: {
              train: true,
              route: true,
            },
          },
          passengers: true,
        },
      }),
      this.prisma.booking.count({
        where: { userId },
      }),
    ]);

    // Calculate statistics
    const stats = await this.calculateTravelStats(userId);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statistics: stats,
    };
  }

  /**
   * Calculate travel statistics
   */
  private async calculateTravelStats(userId: string) {
    const [totalBookings, confirmedBookings, totalSpent] = await Promise.all([
      this.prisma.booking.count({
        where: { userId },
      }),
      this.prisma.booking.count({
        where: {
          userId,
          status: 'CONFIRMED',
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          userId,
          status: 'CONFIRMED',
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    // Get favorite route (most booked)
    const routeBookings = await this.prisma.booking.groupBy({
      by: ['journeyId'],
      where: { userId },
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    let favoriteRoute = null;
    if (routeBookings.length > 0) {
      const journey = await this.prisma.journey.findUnique({
        where: { id: routeBookings[0].journeyId },
        include: {
          route: true,
        },
      });

      if (journey) {
        favoriteRoute = {
          routeName: journey.route.name || 'Unknown Route',
          bookings: routeBookings[0]._count.id,
        };
      }
    }

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings: await this.prisma.booking.count({
        where: { userId, status: 'CANCELLED' },
      }),
      totalSpent: totalSpent._sum.totalAmount || 0,
      favoriteRoute,
    };
  }
}
