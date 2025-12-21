import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ConfirmBookingDto } from "./dto/confirm-booking.dto";
import { CancelBookingDto } from "./dto/cancel-booking.dto";
import { QueryBookingsDto } from "./dto/query-bookings.dto";
// TODO: Re-enable idempotency once shared libs are properly set up
// import { IdempotencyInterceptor } from '@jatra/common/middleware';

@ApiTags("Bookings")
@ApiBearerAuth()
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(IdempotencyInterceptor) // TODO: Re-enable
  @ApiOperation({
    summary: "Create new booking",
    description:
      "Orchestrates seat locking and payment initiation. Returns booking with payment details for checkout. Supports idempotency via Idempotency-Key header.",
  })
  @ApiHeader({
    name: "Idempotency-Key",
    description: "Optional unique key to prevent duplicate bookings on retry",
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: "Booking created successfully with payment pending",
    example: {
      id: "booking-uuid",
      status: "PAYMENT_PENDING",
      reservationId: "reservation-uuid",
      paymentId: "payment-uuid",
      totalAmount: 1500.0,
      seats: [],
      journey: {},
      payment: {},
      message: "Booking created successfully. Please complete payment.",
    },
  })
  @ApiResponse({ status: 400, description: "Invalid booking data" })
  @ApiResponse({ status: 500, description: "Failed to create booking" })
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }

  @Post(":id/confirm")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Confirm booking after payment",
    description:
      "Confirms booking after successful payment, confirms reservation, and emits notification event",
  })
  @ApiResponse({ status: 200, description: "Booking confirmed successfully" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  @ApiResponse({
    status: 400,
    description: "Booking already confirmed or cancelled",
  })
  async confirmBooking(
    @Param("id") bookingId: string,
    @Body() dto: ConfirmBookingDto
  ) {
    return this.bookingsService.confirmBooking(bookingId, dto);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get booking details",
    description:
      "Returns complete booking information including seats, journey, payment, and user details",
  })
  @ApiResponse({ status: 200, description: "Booking details retrieved" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  async getBooking(@Param("id") bookingId: string) {
    return this.bookingsService.getBooking(bookingId);
  }

  @Get("user/:userId")
  @ApiOperation({
    summary: "Get user bookings",
    description:
      "Returns paginated list of user bookings with optional status filter",
  })
  @ApiResponse({
    status: 200,
    description: "User bookings retrieved",
    example: {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    },
  })
  async getUserBookings(
    @Param("userId") userId: string,
    @Query() query: QueryBookingsDto
  ) {
    return this.bookingsService.getUserBookings(userId, query);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Cancel booking",
    description:
      "Cancels booking, processes refund if payment completed, releases seats, and emits cancellation event",
  })
  @ApiResponse({
    status: 200,
    description: "Booking cancelled successfully",
    example: {
      id: "booking-uuid",
      status: "CANCELLED",
      message:
        "Booking cancelled successfully. Refund will be processed within 5-7 business days.",
    },
  })
  @ApiResponse({ status: 404, description: "Booking not found" })
  @ApiResponse({ status: 400, description: "Cannot cancel this booking" })
  async cancelBooking(
    @Param("id") bookingId: string,
    @Body() dto: CancelBookingDto
  ) {
    return this.bookingsService.cancelBooking(bookingId, dto);
  }

  @Get(":id/status")
  @ApiOperation({
    summary: "Get booking status",
    description:
      "Returns booking status with simplified journey and payment information",
  })
  @ApiResponse({
    status: 200,
    description: "Booking status retrieved",
    example: {
      id: "booking-uuid",
      status: "CONFIRMED",
      journey: {
        trainName: "Suborno Express",
        trainNumber: "SE-702",
        departureTime: "2025-11-25T08:00:00Z",
        arrivalTime: "2025-11-25T14:30:00Z",
      },
      seats: [{ seatNumber: "A1", coach: "Coach-A", class: "AC" }],
      payment: {
        status: "COMPLETED",
        amount: 1500.0,
        method: "CREDIT_CARD",
      },
    },
  })
  async getBookingStatus(@Param("id") bookingId: string) {
    return this.bookingsService.getBookingStatus(bookingId);
  }
}
