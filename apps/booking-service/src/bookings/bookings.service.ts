import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { RabbitMQService } from "../common/rabbitmq.service";
import { HttpRetryService } from "../common/http-retry.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ConfirmBookingDto } from "./dto/confirm-booking.dto";
import { CancelBookingDto } from "./dto/cancel-booking.dto";
import { QueryBookingsDto } from "./dto/query-bookings.dto";
import { PaymentFailedEvent } from "@jatra/common/interfaces";

@Injectable()
export class BookingsService implements OnModuleInit {
  private readonly logger = new Logger(BookingsService.name);
  private readonly seatReservationUrl =
    process.env.SEAT_RESERVATION_SERVICE_URL || "http://localhost:3003";
  private readonly paymentUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpRetry: HttpRetryService,
    private readonly rabbitMQ: RabbitMQService
  ) {}

  async onModuleInit() {
    // Subscribe to payment failure events when module initializes
    await this.rabbitMQ.subscribeToPaymentFailures(
      this.handlePaymentFailed.bind(this)
    );
  }

  /**
   * Create booking - Orchestrates seat locking and payment initiation
   */
  async createBooking(dto: CreateBookingDto) {
    this.logger.log(`Creating booking for user ${dto.userId}`);

    let reservationId: string;
    let paymentId: string;

    try {
      // Step 1: Lock seats in reservation service with retry
      const lockResponse = await this.httpRetry.post<any>(
        `${this.seatReservationUrl}/locks/acquire`,
        {
          userId: dto.userId,
          journeyId: dto.journeyId,
          seatIds: dto.seatIds,
          fromStationId: dto.fromStationId,
          toStationId: dto.toStationId,
        },
        "Seat Reservation Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
      );

      reservationId = lockResponse.lockId || lockResponse.id;
      this.logger.log(`✅ Seats locked: ${reservationId}`);

      // Step 2: Initiate payment with retry
      const paymentResponse = await this.httpRetry.post<any>(
        `${this.paymentUrl}/payments/initiate`,
        {
          userId: dto.userId,
          reservationId,
          amount: dto.totalAmount,
          paymentMethod: dto.paymentMethod,
          ...dto.paymentDetails,
        },
        "Payment Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 20000 }
      );

      paymentId = paymentResponse.id;
      this.logger.log(`✅ Payment initiated: ${paymentId}`);

      // Step 3: Create booking record
      const booking = await this.prisma.booking.create({
        data: {
          userId: dto.userId,
          journeyId: dto.journeyId,
          reservationId,
          paymentId,
          totalAmount: dto.totalAmount,
          status: "PAYMENT_PENDING",
          seats: {
            create: dto.seatIds.map((seatId) => ({ seatId })),
          },
        },
        include: {
          seats: true,
          journey: {
            include: {
              train: true,
              route: {
                include: {
                  stops: {
                    include: {
                      fromStation: true,
                      toStation: true,
                    },
                  },
                },
              },
            },
          },
          reservation: true,
          payment: true,
        },
      });

      this.logger.log(`✅ Booking created: ${booking.id}`);

      return {
        id: booking.id,
        status: booking.status,
        reservationId,
        paymentId,
        totalAmount: booking.totalAmount,
        seats: booking.seats,
        journey: booking.journey,
        payment: booking.payment,
        message: "Booking created successfully. Please complete payment.",
      };
    } catch (error) {
      this.logger.error("❌ Booking creation failed", error.message);

      // Rollback: Release seats if payment initiation failed
      if (reservationId && !paymentId) {
        try {
          await this.httpRetry.post(
            `${this.seatReservationUrl}/locks/release`,
            {
              lockId: reservationId,
              userId: dto.userId,
            },
            "Seat Reservation Service",
            { maxRetries: 2, initialDelayMs: 500, timeoutMs: 10000 }
          );
          this.logger.log("🔄 Seats released after payment failure");
        } catch (releaseError) {
          this.logger.error("Failed to release seats", releaseError.message);
        }
      }

      throw new InternalServerErrorException(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(bookingId: string, dto: ConfirmBookingDto) {
    this.logger.log(`Confirming booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        reservation: true,
        payment: true,
        user: true,
        journey: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status === "CONFIRMED") {
      throw new BadRequestException("Booking already confirmed");
    }

    if (booking.status === "CANCELLED") {
      throw new BadRequestException("Cannot confirm cancelled booking");
    }

    try {
      // Step 1: Confirm payment in payment service with retry
      await this.httpRetry.post(
        `${this.paymentUrl}/payments/confirm`,
        {
          paymentId: dto.paymentId,
          transactionId: dto.transactionId,
        },
        "Payment Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 20000 }
      );

      // Step 2: Confirm reservation with retry
      await this.httpRetry.post(
        `${this.seatReservationUrl}/reservations/confirm`,
        {
          lockId: booking.reservationId,
          userId: booking.userId,
        },
        "Seat Reservation Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
      );

      // Step 3: Update booking status
      const confirmedBooking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: {
          user: true,
          seats: {
            include: {
              seat: true,
            },
          },
          journey: {
            include: {
              train: true,
            },
          },
          payment: true,
          reservation: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
        },
      });

      // Step 4: Emit event for notification and ticket services

      await this.rabbitMQ.publishBookingConfirmed({
        bookingId: confirmedBooking.id,
        userId: confirmedBooking.userId,
        email: confirmedBooking.user.email,
        phone: confirmedBooking.user.phone,
        journeyId: confirmedBooking.journeyId,
        totalAmount: confirmedBooking.totalAmount,
        seats: confirmedBooking.seats.map((s) => ({
          seatId: s.seat.id,
          seatNumber: s.seat.seatNumber,
          coachNumber: `Coach-${s.seat.coachId}`,
        })),
        journey: {
          trainName: confirmedBooking.journey.train.name,
          trainNumber: confirmedBooking.journey.train.trainNumber,
          departureTime: confirmedBooking.journey.departureTime,
          arrivalTime: confirmedBooking.journey.arrivalTime,
          fromStation: confirmedBooking.reservation.fromStation.name,
          toStation: confirmedBooking.reservation.toStation.name,
        },
      });

      this.logger.log(`✅ Booking confirmed and event published: ${bookingId}`);

      return confirmedBooking;
    } catch (error) {
      this.logger.error("❌ Booking confirmation failed", error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || "Failed to confirm booking"
      );
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        seats: {
          include: {
            seat: {
              include: {
                coach: true,
              },
            },
          },
        },
        journey: {
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
                    stopOrder: "asc",
                  },
                },
              },
            },
          },
        },
        reservation: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  /**
   * Get user's bookings with filters
   */
  async getUserBookings(userId: string, query: QueryBookingsDto) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
        include: {
          seats: {
            include: {
              seat: {
                include: {
                  coach: true,
                },
              },
            },
          },
          journey: {
            include: {
              train: true,
              route: {
                include: {
                  stops: {
                    include: {
                      fromStation: true,
                      toStation: true,
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cancel booking and process refund
   */
  async cancelBooking(bookingId: string, dto: CancelBookingDto) {
    this.logger.log(`Cancelling booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        reservation: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new BadRequestException("Booking already cancelled");
    }

    if (!["PAYMENT_PENDING", "CONFIRMED"].includes(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel booking with status: ${booking.status}`
      );
    }

    try {
      // Step 1: Cancel/Refund payment if completed with retry
      if (booking.payment.status === "COMPLETED") {
        await this.httpRetry.post(
          `${this.paymentUrl}/payments/${booking.paymentId}/refund`,
          {
            amount: booking.totalAmount,
            reason: dto.reason,
          },
          "Payment Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 20000 }
        );
        this.logger.log("✅ Payment refunded");
      } else {
        await this.httpRetry.post(
          `${this.paymentUrl}/payments/${booking.paymentId}/cancel`,
          {},
          "Payment Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
        );
        this.logger.log("✅ Payment cancelled");
      }

      // Step 2: Cancel reservation with retry
      await this.httpRetry.post(
        `${this.seatReservationUrl}/reservations/${booking.reservationId}/cancel`,
        {
          userId: booking.userId,
        },
        "Seat Reservation Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
      );
      this.logger.log("✅ Reservation cancelled");

      // Step 3: Update booking status
      const cancelledBooking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: {
          seats: true,
          journey: true,
          payment: true,
        },
      });

      // Step 4: Emit cancellation event
      await this.rabbitMQ.publishBookingCancelled({
        bookingId: cancelledBooking.id,
        userId: cancelledBooking.userId,
        reservationId: booking.reservationId,
        paymentId: booking.paymentId,
        refundAmount: booking.totalAmount,
        reason: dto.reason,
      });

      this.logger.log(`✅ Booking cancelled: ${bookingId}`);

      return {
        ...cancelledBooking,
        message:
          "Booking cancelled successfully. Refund will be processed within 5-7 business days.",
      };
    } catch (error) {
      this.logger.error("❌ Booking cancellation failed", error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }

  /**
   * Get booking status with journey details
   */
  async getBookingStatus(bookingId: string) {
    const booking = await this.getBooking(bookingId);

    return {
      id: booking.id,
      status: booking.status,
      journey: {
        trainName: booking.journey.train.name,
        trainNumber: booking.journey.train.trainNumber,
        departureTime: booking.journey.departureTime,
        arrivalTime: booking.journey.arrivalTime,
      },
      seats: booking.seats.map((bs) => ({
        seatNumber: bs.seat.seatNumber,
        coach: bs.seat.coach.coachCode,
        class: bs.seat.coach.coachType,
      })),
      payment: {
        status: booking.payment.status,
        amount: booking.payment.amount,
        method: booking.payment.paymentMethod,
      },
      timestamps: {
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  }

  /**
   * Handle payment failure events - Rollback booking
   */
  private async handlePaymentFailed(event: PaymentFailedEvent) {
    this.logger.log(
      `🔄 Handling payment failure for payment ${event.data.paymentId}`
    );

    try {
      const { paymentId, reservationId, bookingId, reason } = event.data;

      // Find booking if bookingId is provided, otherwise find by paymentId
      const booking = bookingId
        ? await this.prisma.booking.findUnique({ where: { id: bookingId } })
        : await this.prisma.booking.findFirst({ where: { paymentId } });

      if (!booking) {
        this.logger.warn(
          `Booking not found for payment ${paymentId}, may have been already rolled back`
        );
        return;
      }

      // Skip if already cancelled or completed
      if (booking.status === "CANCELLED" || booking.status === "CONFIRMED") {
        this.logger.log(
          `Booking ${booking.id} already ${booking.status}, skipping rollback`
        );
        return;
      }

      // Step 1: Release seats
      try {
        await this.httpRetry.post(
          `${this.seatReservationUrl}/locks/release`,
          { lockId: reservationId, userId: booking.userId },
          "Seat Reservation Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 10000 }
        );
        this.logger.log(`✅ Released seats for reservation ${reservationId}`);
      } catch (error) {
        this.logger.error(`Failed to release seats: ${error.message}`);
        // Continue with booking cancellation even if seat release fails
      }

      // Step 2: Update booking status to CANCELLED
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Booking ${booking.id} rolled back due to payment failure: ${reason}`
      );

      // Step 3: Emit booking cancelled event for notifications
      await this.rabbitMQ.publishBookingCancelled({
        bookingId: booking.id,
        userId: booking.userId,
        reservationId,
        paymentId,
        refundAmount: 0, // No refund since payment failed
        reason: `Payment failed: ${reason}`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to rollback booking: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
