import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { RabbitMQService } from "../common/rabbitmq.service";
import { HttpRetryService } from "../common/http-retry.service";

interface PaymentQueueMessage {
  bookingId: string;
  userId: string;
  reservationId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
  retryCount?: number;
}

@Injectable()
export class PaymentQueueProcessor implements OnModuleInit {
  private readonly logger = new Logger(PaymentQueueProcessor.name);
  private readonly paymentUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpRetry: HttpRetryService,
    private readonly rabbitMQ: RabbitMQService
  ) {}

  async onModuleInit() {
    // Subscribe to payment queue
    await this.rabbitMQ.consume(
      "payment.processing.queue",
      this.processPayment.bind(this)
    );
    this.logger.log("Payment queue processor started");
  }

  /**
   * Process payment asynchronously from queue
   */
  async processPayment(message: PaymentQueueMessage): Promise<void> {
    const {
      bookingId,
      userId,
      reservationId,
      amount,
      paymentMethod,
      paymentDetails,
      retryCount = 0,
    } = message;

    this.logger.log(
      `Processing payment for booking ${bookingId}, attempt ${retryCount + 1}`
    );

    try {
      // Update booking status to PROCESSING
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "PAYMENT_PROCESSING" },
      });

      // Initiate payment with payment service
      const paymentResponse = await this.httpRetry.post<any>(
        `${this.paymentUrl}/payments/initiate`,
        {
          userId,
          reservationId,
          amount,
          paymentMethod,
          ...paymentDetails,
        },
        "Payment Service",
        { maxRetries: 2, initialDelayMs: 1000, timeoutMs: 30000 }
      );

      const paymentId = paymentResponse.id;
      this.logger.log(
        `✅ Payment initiated: ${paymentId} for booking ${bookingId}`
      );

      // Poll payment status (or use webhook)
      const finalStatus = await this.pollPaymentStatus(paymentId);

      if (finalStatus === "COMPLETED") {
        // Update booking as confirmed
        await this.prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentId,
            confirmedAt: new Date(),
          },
        });

        // Publish booking confirmed event
        await this.rabbitMQ.publish("booking.exchange", "booking.confirmed", {
          bookingId,
          userId,
          reservationId,
          paymentId,
          confirmedAt: new Date().toISOString(),
        });

        this.logger.log(`✅ Booking ${bookingId} confirmed successfully`);
      } else if (finalStatus === "FAILED") {
        throw new Error("Payment failed");
      }
    } catch (error) {
      this.logger.error(
        `❌ Payment processing failed for booking ${bookingId}: ${error.message}`
      );

      // Retry logic
      if (retryCount < this.MAX_RETRIES) {
        this.logger.log(
          `Retrying payment for booking ${bookingId}, attempt ${retryCount + 2}`
        );

        // Re-queue with incremented retry count
        await this.rabbitMQ.publish("booking.exchange", "payment.process", {
          ...message,
          retryCount: retryCount + 1,
        });
      } else {
        // Max retries exhausted, mark as failed
        await this.prisma.booking.update({
          where: { id: bookingId },
          data: { status: "PAYMENT_FAILED" },
        });

        // Release seat locks
        try {
          await this.httpRetry.post(
            `${
              process.env.SEAT_RESERVATION_SERVICE_URL ||
              "http://localhost:3003"
            }/locks/release`,
            { reservationId },
            "Seat Reservation Service",
            { maxRetries: 2, initialDelayMs: 500, timeoutMs: 10000 }
          );
          this.logger.log(`✅ Seats released for failed booking ${bookingId}`);
        } catch (releaseError) {
          this.logger.error(
            `Failed to release seats for booking ${bookingId}: ${releaseError.message}`
          );
        }

        // Publish payment failed event
        await this.rabbitMQ.publish("booking.exchange", "payment.failed", {
          bookingId,
          userId,
          reservationId,
          reason: error.message,
          failedAt: new Date().toISOString(),
        });

        this.logger.error(
          `❌ Booking ${bookingId} failed after ${this.MAX_RETRIES} retries`
        );
      }
    }
  }

  /**
   * Poll payment status until complete or failed
   */
  private async pollPaymentStatus(
    paymentId: string,
    maxAttempts = 10
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const response = await this.httpRetry.get<any>(
          `${this.paymentUrl}/payments/${paymentId}`,
          "Payment Service",
          { maxRetries: 1, initialDelayMs: 500, timeoutMs: 5000 }
        );

        if (response.status === "COMPLETED" || response.status === "FAILED") {
          return response.status;
        }

        this.logger.log(
          `Payment ${paymentId} status: ${response.status}, polling again...`
        );
      } catch (error) {
        this.logger.warn(
          `Failed to check payment status (attempt ${attempt}): ${error.message}`
        );
      }
    }

    throw new Error(`Payment status polling timeout for ${paymentId}`);
  }
}
