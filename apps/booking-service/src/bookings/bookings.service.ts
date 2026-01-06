import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { RabbitMQService } from "../common/rabbitmq.service";
import { HttpRetryService } from "../common/http-retry.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ConfirmBookingDto } from "./dto/confirm-booking.dto";
import { CancelBookingDto } from "./dto/cancel-booking.dto";
import { QueryBookingsDto } from "./dto/query-bookings.dto";
import { PaymentFailedEvent, TrainUpdateEvent } from "@jatra/common/interfaces";

@Injectable()
export class BookingsService implements OnModuleInit {
  private readonly logger = new Logger(BookingsService.name);
  private readonly seatReservationUrl =
    process.env.SEAT_RESERVATION_SERVICE_URL || "http://localhost:3003";
  private readonly paymentUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";
  private readonly ticketServiceUrl =
    process.env.TICKET_SERVICE_URL || "http://localhost:3006";

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
    
    // Subscribe to train update events (Delays, Cancellations)
    await this.rabbitMQ.subscribeToTrainUpdates(
      this.handleTrainUpdate.bind(this)
    );
  }

  /**
   * Create booking - Orchestrates seat locking and payment initiation
   */
  async createBooking(dto: CreateBookingDto) {
    this.logger.log(`Creating booking for user ${dto.userId}`);

    // Step 0: Validate daily ticket limit (Max 4 tickets per day)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        userId: dto.userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "PAYMENT_PENDING"],
        },
      },
      include: {
        seats: true,
      },
    });

    const existingSeatCount = existingBookings.reduce(
      (sum, booking) => sum + booking.seats.length,
      0
    );

    if (existingSeatCount + dto.seatIds.length > 4) {
      throw new BadRequestException(
        `You can only purchase a maximum of 4 tickets per day. You have already booked ${existingSeatCount} tickets today.`
      );
    }

    let reservationId: string;
    let lockId: string;
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

      ({ lockId, reservationId } = lockResponse); // Destructure lockId and reservationId
      this.logger.log(`✅ Seats locked: ${reservationId} (Lock ID: ${lockId})`);

      // Fetch seat details for passenger mapping
      const seats = await this.prisma.seat.findMany({
        where: { id: { in: dto.seatIds } },
        include: { coach: true },
      });

      const passengerData = dto.passengers?.map((p) => {
        const seat = seats.find((s) => s.id === p.seatId);
        return {
          passengerName: p.name,
          passengerAge: p.age,
          passengerGender: p.gender,
          seatId: p.seatId,
          seatNumber: seat?.seatNumber || "", 
          coachId: seat?.coachId || "",
          fare: seat?.baseFare || 650, // Fallback fare
        };
      }) || [];

      // Step 2: Create booking record with PAYMENT_PENDING status
      const booking = await this.prisma.booking.create({
        data: {
          userId: dto.userId,
          journeyId: dto.journeyId,
          reservationId, // Use the new reservationId
          totalAmount: dto.totalAmount > 0 ? dto.totalAmount : dto.seatIds.length * 650, 
          status: "PAYMENT_PENDING",
          seats: {
            create: dto.seatIds.map((seatId) => ({ seatId })),
          },
          passengers: {
            create: passengerData,
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
          reservation: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
          passengers: true,
        },
      });

      this.logger.log(`✅ Booking created: ${booking.id}`);

      // Step 3: Initiate payment
      const paymentPayload: any = {
        reservationId,
        bookingId: booking.id,
        userId: dto.userId,
        amount: booking.totalAmount, // Use the persisted amount from booking
        currency: 'BDT',
        paymentMethod: dto.paymentMethod,
        customerName: dto.customerName || 'Customer',
        customerEmail: dto.customerEmail || 'customer@example.com',
      };

      if (dto.paymentMethod === 'MOBILE_BANKING' || dto.paymentMethod === 'WALLET') {
        paymentPayload.mobileNumber = dto.customerPhone;
      } else if (dto.paymentMethod === 'CREDIT_CARD' || dto.paymentMethod === 'DEBIT_CARD') {
        paymentPayload.cardDetails = dto.paymentDetails;
      } else if (dto.paymentMethod === 'GATEWAY') {
        // For GATEWAY, we don't need phone/card details upfront
        paymentPayload.customerPhone = dto.customerPhone;
      }

      const paymentResponse = await this.httpRetry.post<any>(
        `${this.paymentUrl}/payments/initiate`,
        paymentPayload,
        "Payment Service",
        { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
      );

      paymentId = paymentResponse.paymentId || paymentResponse.id;
      this.logger.log(`✅ Payment initiated: ${paymentId}`);

      // Step 4: Update booking with payment ID
      const updatedBooking = await this.prisma.booking.update({
        where: { id: booking.id },
        data: { paymentId },
        include: {
          seats: {
            include: {
              seat: {
                include: {
                  coach: true
                }
              }
            }
          },
          journey: {
            include: {
              train: true,
              route: true
            }
          },
          reservation: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
          payment: true
        }
      });

      return {
        ...updatedBooking,
        gatewayUrl: paymentResponse.gatewayUrl,
        expiresAt: paymentResponse.expiresAt,
      };
    } catch (error) {
      this.logger.error(`❌ Booking creation failed: ${error.message}`, error.stack);

      // Rollback: Release seats if booking creation fails
      if (lockId) {
        await this.httpRetry.delete(
          `${this.seatReservationUrl}/locks/${lockId}`,
          "Seat Reservation Service",
          { maxRetries: 2, initialDelayMs: 500, timeoutMs: 10000 }
        ).catch(err => this.logger.error('Failed to release seats', err.message));
      }

      if (error instanceof HttpException) {
        throw error;
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
        ticket: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status === "CONFIRMED") {
      this.logger.warn(`Booking ${bookingId} already confirmed. Checking for ticket...`);
      if (!booking.ticket) {
          try {
              const ticket = await this.generateTicket(bookingId);
              return { ...booking, ticket, success: true, message: "Booking confirmed successfully" };
          } catch (e) {
              this.logger.error(`Failed to generate ticket for already confirmed booking ${bookingId}`, e);
          }
      }
      return { ...booking, success: true, message: "Booking already confirmed" };
    }

    if (booking.status === "CANCELLED") {
      throw new BadRequestException("Cannot confirm cancelled booking");
    }

    try {
      // Step 1: Confirm payment in payment service with retry
      try {
        await this.httpRetry.post(
          `${this.paymentUrl}/payments/confirm`,
          {
            transactionId: dto.transactionId,
            status: 'COMPLETED',
          },
          "Payment Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 20000 }
        );
      } catch (err: any) {
         this.logger.error(`❌ Payment confirmation error: ${err.message}`, JSON.stringify(err.response?.data));
         
         const errorMessage = err.response?.data?.message;
         const isAlreadyConfirmed = 
            (typeof errorMessage === 'string' && errorMessage.includes("confirmed")) ||
            (Array.isArray(errorMessage) && errorMessage.some(e => e.includes("confirmed"))) ||
            (err.message && err.message.includes("confirmed"));

         // If payment is already confirmed (400), we should proceed (idempotency)
         if (err.response?.status === 400 && isAlreadyConfirmed) {
             this.logger.log(`⚠️ Payment already confirmed for ${dto.paymentId}, proceeding with booking confirmation`);
         } else {
             throw err;
         }
      }

      // Step 2: Confirm reservation with retry
      try {
        await this.httpRetry.post(
          `${this.seatReservationUrl}/reservations/confirm`,
          {
            lockId: booking.reservation.lockId,
            paymentId: dto.paymentId,
          },
          "Seat Reservation Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
        );
      } catch (err: any) {
         this.logger.error(`❌ Reservation confirmation error: ${err.message}`, JSON.stringify(err.response?.data));

         // Idempotency for reservation confirmation
         const errorMessage = err.response?.data?.message;
         const isAlreadyConfirmed = 
             (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes("confirmed")) ||
             (Array.isArray(errorMessage) && errorMessage.some(e => e.toLowerCase().includes("confirmed"))) ||
             (err.message && err.message.toLowerCase().includes("confirmed"));

         if (err.response?.status === 400 && isAlreadyConfirmed) {
             this.logger.log(`⚠️ Reservation already confirmed for ${booking.reservationId}, proceeding`);
         } else {
             throw err;
         }
      }

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
          ticket: true,
          reservation: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
        },
      });

      // Step 3.5: Generate Ticket via Ticket Service
      let ticket: any;
      try {
        ticket = await this.generateTicket(bookingId);
        this.logger.log(`✅ Ticket generated via service: ${ticket.ticketNumber}`);
      } catch (err) {
        this.logger.error(`Failed to generate ticket for ${bookingId}`, err);
        // We continue even if ticket generation fails
      }

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
        ticketNumber: ticket?.ticketNumber,
        pdfUrl: ticket?.pdfUrl,
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
    // Include ticket in the response
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
        passengers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        reservation: {
          include: {
            fromStation: true,
            toStation: true,
          },
        },
        payment: true,
        ticket: true, // Include ticket
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Auto-generate ticket if confirmed but missing
    if (booking.status === "CONFIRMED" && !booking.ticket) {
      try {
         const ticket = await this.generateTicket(bookingId);
         return {
            ...booking,
            ticket
         };
      } catch (err) {
         this.logger.error(`Failed to auto-generate ticket for ${bookingId}`, err);
         // Return booking without ticket if generation fails, instead of crashing
         return booking;
      }
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
          ticket: true,
          reservation: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
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
      let refundAmount = 0;
      if (booking.payment.status === "COMPLETED") {
        // Policy: Deduct 20% cancellation fee
        const deduction = booking.totalAmount * 0.20;
        refundAmount = booking.totalAmount - deduction;
        
        await this.httpRetry.post(
          `${this.paymentUrl}/payments/${booking.paymentId}/refund`,
          {
            amount: refundAmount,
            reason: `${dto.reason || 'Cancellation'} (20% fee applied)`,
          },
          "Payment Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 20000 }
        );
        this.logger.log(`✅ Payment refunded: ${refundAmount} (20% fee deducted)`);
      } else {
        await this.httpRetry.post(
          `${this.paymentUrl}/payments/${booking.paymentId}/cancel`,
          {},
          "Payment Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
        );
        this.logger.log("✅ Payment cancelled");
      }

      // Step 2: Cancel reservation with retry (handle expired reservations gracefully)
      try {
        await this.httpRetry.delete(
          `${this.seatReservationUrl}/reservations/${booking.reservationId}`,
          "Seat Reservation Service",
          { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
        );
        this.logger.log("✅ Reservation cancelled");
      } catch (reservationError) {
        // If reservation is already expired or doesn't exist, log but don't fail the cancellation
        this.logger.warn(
          `⚠️ Could not cancel reservation ${booking.reservationId}: ${reservationError.message}. Proceeding with booking cancellation.`
        );
      }

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
        refundAmount: refundAmount, // Emit the actual refunded amount
        reason: dto.reason,
      });

      this.logger.log(`✅ Booking cancelled: ${bookingId}`);

      return {
        ...cancelledBooking,
        message:
          "Booking cancelled successfully. Fund will transfer after 3 days.",
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

  /**
   * Handle train update events (Delay, Cancellation)
   * Finds all passengers of the affected journey and notifies them.
   */
  private async handleTrainUpdate(event: TrainUpdateEvent) {
    this.logger.log(`📢 Handling train update: ${event.data.updateType} for train ${event.data.trainNumber}`);

    try {
      const { journeyId, trainNumber, trainName, updateType, delayMinutes, reason, newDepartureTime } = event.data;

      if (!journeyId) {
        this.logger.warn("Skipping train update notification: No journeyId provided");
        return;
      }

      // Find all CONFIRMED bookings for this journey
      const bookings = await this.prisma.booking.findMany({
        where: {
          journeyId: journeyId,
          status: "CONFIRMED",
        },
        include: {
          user: true, // Need email
        },
      });

      if (bookings.length === 0) {
        this.logger.log(`No confirmed bookings found for journey ${journeyId}, skipping notifications.`);
        return;
      }

      this.logger.log(`Found ${bookings.length} passengers to notify.`);

      // Send notification to each passenger
      for (const booking of bookings) {
        let subject = "";
        let content = "";

        if (updateType === 'DELAY') {
            subject = `Train Delayed - ${trainName} (${trainNumber})`;
            content = `We regret to inform you that your train ${trainName} (${trainNumber}) has been delayed by approximately ${delayMinutes} minutes.\n` +
                      `New Departure Time: ${new Date(newDepartureTime).toLocaleString()}\n` +
                      `Reason: ${reason}\n\n` +
                      `We are sorry for the inconvenience.`;
        } else if (updateType === 'CANCEL') {
            subject = `Train Cancelled - ${trainName}`;
            content = `Your train ${trainName} (${trainNumber}) has been CANCELLED.\nReason: ${reason}.\nA full refund will be processed shortly.`;
        }

        if (subject) {
            await this.rabbitMQ.publishSendEmail({
                userId: booking.userId,
                to: booking.user.email,
                subject: subject,
                template: 'booking_confirmation', // HACK
                context: {
                    trainName,
                    trainNumber,
                    message: content,
                }
            });
            this.logger.log(`Queued notification for user ${booking.userId} (${booking.user.email})`);
        }
      }
    } catch (error) {
       this.logger.error("Failed to handle train update", error);
    }
  }

  /**
   * Get booking by ticket number
   */
  async getBookingByTicketNumber(ticketNumber: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        booking: {
          include: {
            journey: {
              include: {
                train: true,
                route: {
                  include: {
                    stops: {
                      include: {
                         fromStation: true,
                         toStation: true
                      }
                    }
                  }
                },
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true
                  }
                }
              }
            },
            reservation: {
               include: {
                 fromStation: true,
                 toStation: true
               }
            },
            payment: true,
            user: true,
            passengers: true
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket not found: ${ticketNumber}`);
    }

    return {
       ...ticket.booking,
       ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
          pdfUrl: ticket.pdfUrl,
          isValidated: ticket.isValidated,
          validatedAt: ticket.validatedAt,
          validatedBy: ticket.validatedBy
       }
    };
  }

  /**
   * Generate Ticket for a confirmed booking
   */
  async generateTicket(bookingId: string) {
    return this.httpRetry.post<any>(
      `${this.ticketServiceUrl}/tickets/generate`,
      { bookingId },
      "Ticket Service",
      { maxRetries: 3, initialDelayMs: 1000, timeoutMs: 15000 }
    );
  }

  /**
   * Resend booking confirmation email
   */
  async resendBookingEmail(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        journey: {
          include: {
            train: true
          }
        },
        reservation: {
          include: {
            fromStation: true,
            toStation: true
          }
        },
        seats: {
          include: {
            seat: true
          }
        },
        ticket: true
      }
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found: ${bookingId}`);
    }

    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("Booking is not confirmed");
    }

    // Publish event
    await this.rabbitMQ.publishBookingConfirmed({
      bookingId: booking.id,
      userId: booking.userId,
      email: booking.user.email,
      phone: booking.user.phone,
      journeyId: booking.journeyId,
      totalAmount: booking.totalAmount,
      seats: booking.seats.map((s) => ({
        seatId: s.seat.id,
        seatNumber: s.seat.seatNumber,
        coachNumber: `Coach-${s.seat.coachId}`,
      })),
      journey: {
        trainName: booking.journey.train.name,
        trainNumber: booking.journey.train.trainNumber,
        departureTime: booking.journey.departureTime,
        arrivalTime: booking.journey.arrivalTime,
        fromStation: booking.reservation.fromStation.name,
        toStation: booking.reservation.toStation.name,
      },
      ticketNumber: booking.ticket?.ticketNumber,
      pdfUrl: booking.ticket?.pdfUrl,
    });

    return { message: "Email queued for delivery" };
  }
}
