import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../common/prisma.service";
import { RabbitMQService } from "../common/rabbitmq.service";
import { GatewayService } from "../gateway/gateway.service";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { ConfirmPaymentDto } from "./dto/confirm-payment.dto";
import { RefundPaymentDto } from "./dto/refund-payment.dto";
import { QueryPaymentDto } from "./dto/query-payment.dto";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymentExpiryMinutes = parseInt(
    process.env.PAYMENT_EXPIRY_MINUTES || "15"
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly gatewayService: GatewayService,
    private readonly rabbitMQ: RabbitMQService
  ) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    // Check if payment already exists for reservation
    const existingPayment = await this.prisma.payment.findUnique({
      where: { reservationId: dto.reservationId },
    });

    if (existingPayment) {
      if (existingPayment.status === "COMPLETED") {
        throw new ConflictException(
          "Payment already completed for this reservation"
        );
      }
      
      // If payment is pending/processing, we allow re-initiation by updating the existing record
      // This handles cases where user closed the window or transaction failed/expired without callback
      if (
        existingPayment.status === "PENDING" ||
        existingPayment.status === "PROCESSING"
      ) {
         this.logger.log(`Re-initiating payment for reservation ${dto.reservationId}`);
         // We will proceed to update this record instead of creating a new one
      }
    }

    // Validate card details for card payments
    if (
      (dto.paymentMethod === "CREDIT_CARD" ||
        dto.paymentMethod === "DEBIT_CARD") &&
      !dto.cardDetails
    ) {
      throw new BadRequestException("Card details required for card payments");
    }

    // Validate mobile number for mobile banking
    if (dto.paymentMethod === "MOBILE_BANKING" && !dto.mobileNumber) {
      throw new BadRequestException(
        "Mobile number required for mobile banking"
      );
    }

    // For GATEWAY method, we skip detail validation as it's handled by the hosted page
    const customerPhone = dto.mobileNumber || (dto as any).customerPhone || "01700000000";

    // Generate ID early to include in redirection URLs
    // logic: Reuse existing ID if available to ensure consistency
    let paymentId = uuidv4();
    if (existingPayment) {
        paymentId = existingPayment.id;
    }
    
    // Unique ID <= 30 chars for SSLCommerz
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Process payment through gateway
    const gatewayResponse = await this.gatewayService.processPayment({
      amount: dto.amount,
      currency: dto.currency || process.env.DEFAULT_CURRENCY || "BDT",
      paymentMethod: dto.paymentMethod,
      customerName: dto.customerName || "Customer",
      customerEmail: dto.customerEmail || "customer@example.com",
      customerPhone,
      productName: `Railway Ticket - Reservation ${dto.reservationId}`,
      successUrl: `${process.env.FRONTEND_URL}/payment/success?bookingId=${dto.bookingId}&paymentId=${paymentId}&tran_id=${transactionId}`,
      failUrl: `${process.env.FRONTEND_URL}/payment/failed?bookingId=${dto.bookingId}&paymentId=${paymentId}&tran_id=${transactionId}`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?bookingId=${dto.bookingId}&paymentId=${paymentId}&tran_id=${transactionId}`,
      ipnUrl: `${process.env.PAYMENT_SERVICE_URL}/gateway/webhook/sslcommerz/ipn`,
      cardDetails: dto.cardDetails,
      mobileNumber: dto.mobileNumber,
      bookingId: dto.bookingId,
      transactionId: transactionId,
    });

    // Create payment record
    const expiresAt = new Date(
      Date.now() + this.paymentExpiryMinutes * 60 * 1000
    );

    const payment = await this.prisma.payment.upsert({
      where: { reservationId: dto.reservationId },
      update: {
        amount: dto.amount,
        currency: process.env.DEFAULT_CURRENCY || "BDT",
        paymentMethod: dto.paymentMethod,
        status: gatewayResponse.success ? "PROCESSING" : "FAILED",
        transactionId: gatewayResponse.transactionId,
        gatewayResponse: gatewayResponse as any,
        failureReason: gatewayResponse.failureReason,
        paidAt: gatewayResponse.success ? new Date() : null, // This might be premature if it's just processing, but following previous logic
        updatedAt: new Date(),
      },
      create: {
        id: paymentId,
        reservationId: dto.reservationId,
        userId: dto.userId,
        amount: dto.amount,
        currency: process.env.DEFAULT_CURRENCY || "BDT",
        paymentMethod: dto.paymentMethod,
        status: gatewayResponse.success ? "PROCESSING" : "FAILED",
        transactionId: gatewayResponse.transactionId,
        gatewayResponse: gatewayResponse as any,
        failureReason: gatewayResponse.failureReason,
        paidAt: gatewayResponse.success ? new Date() : null,
      },
    });

    this.logger.log(
      `Payment initiated: ${payment.id}, Transaction: ${gatewayResponse.transactionId}`
    );

    const response = {
      paymentId: payment.id,
      transactionId: gatewayResponse.transactionId,
      status: payment.status,
      amount: payment.amount,
      expiresAt,
      gatewayResponse: gatewayResponse.success
        ? {
            authCode: gatewayResponse.authCode,
            bankReference: gatewayResponse.bankReference,
          }
        : undefined,
      gatewayUrl: gatewayResponse.gatewayPageURL,
      failureReason: gatewayResponse.failureReason,
    };

    // Append paymentId to gatewayUrl for mock/callback flow
    if (response.gatewayUrl && payment.id) {
       const separator = response.gatewayUrl.includes('?') ? '&' : '?';
       response.gatewayUrl = `${response.gatewayUrl}${separator}paymentId=${payment.id}`;
    }

    return response;
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId: dto.transactionId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === "COMPLETED") {
      throw new BadRequestException("Payment already confirmed");
    }

    if (payment.status === "CANCELLED") {
      throw new BadRequestException("Payment was cancelled");
    }

    const newStatus = dto.status === "COMPLETED" ? "COMPLETED" : "FAILED";

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        gatewayResponse: dto.gatewayResponse as any,
        paidAt: dto.status === "COMPLETED" ? new Date() : payment.paidAt,
        failureReason:
          dto.status === "FAILED"
            ? dto.gatewayResponse?.bankReference || "Payment failed"
            : null,
      },
    });

    this.logger.log(`Payment confirmed: ${payment.id}, Status: ${newStatus}`);

    // Emit event based on payment status
    if (newStatus === "COMPLETED") {
      await this.rabbitMQ.publishPaymentCompleted({
        paymentId: updatedPayment.id,
        userId: payment.userId,
        reservationId: payment.reservationId,
        bookingId: payment.reservationId,
        amount: payment.amount,
        transactionId: dto.transactionId,
        paymentMethod: payment.paymentMethod,
      });
    } else if (newStatus === "FAILED") {
      await this.rabbitMQ.publishPaymentFailed({
        paymentId: updatedPayment.id,
        userId: payment.userId,
        reservationId: payment.reservationId,
        bookingId: payment.reservationId,
        amount: payment.amount,
        reason: dto.gatewayResponse?.bankReference || "Payment failed",
        errorCode: dto.gatewayResponse?.authCode,
      });
    }

    return {
      success: true,
      payment: updatedPayment,
      message: `Payment ${newStatus.toLowerCase()} successfully`,
    };
  }

  async getPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }

  async getPaymentByReservation(reservationId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reservationId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found for this reservation");
    }

    return payment;
  }

  async getUserPayments(userId: string, query: QueryPaymentDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      userId,
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async refundPayment(id: string, dto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status !== "COMPLETED") {
      throw new BadRequestException("Only completed payments can be refunded");
    }

    const refundAmount = dto.amount || payment.amount;

    // Validate refund amount
    if (refundAmount > payment.amount) {
      throw new BadRequestException(
        "Refund amount cannot exceed payment amount"
      );
    }

    if (
      payment.refundAmount &&
      refundAmount > payment.amount - payment.refundAmount
    ) {
      throw new BadRequestException("Total refund exceeds payment amount");
    }

    // Process refund through gateway
    const gatewayResponse = await this.gatewayService.processRefund(
      payment.transactionId!,
      refundAmount
    );

    if (!gatewayResponse.success) {
      throw new BadRequestException(`Refund failed at gateway: ${gatewayResponse.failureReason || 'Unknown reason'}`);
    }

    // Update payment
    const totalRefunded = (payment.refundAmount || 0) + refundAmount;
    const newStatus =
      totalRefunded >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: newStatus,
        refundAmount: totalRefunded,
        refundedAt: new Date(),
      },
    });

    this.logger.log(
      `Payment refunded: ${id}, Amount: ${refundAmount}, Status: ${newStatus}`
    );

    // Emit refund completed event
    await this.rabbitMQ.publishRefundCompleted({
      refundId: `refund-${Date.now()}`,
      paymentId: updatedPayment.id,
      bookingId: payment.reservationId,
      userId: payment.userId,
      amount: refundAmount,
      transactionId: gatewayResponse.transactionId || "",
    });

    return {
      success: true,
      payment: updatedPayment,
      refundAmount,
      message: "Refund processed successfully",
    };
  }

  async cancelPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === "COMPLETED") {
      throw new BadRequestException(
        "Cannot cancel completed payment. Use refund instead."
      );
    }

    if (payment.status === "CANCELLED") {
      throw new BadRequestException("Payment already cancelled");
    }

    if (payment.status !== "PENDING" && payment.status !== "PROCESSING") {
      throw new BadRequestException(
        "Can only cancel pending or processing payments"
      );
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    this.logger.log(`Payment cancelled: ${id}`);

    return {
      success: true,
      payment: updatedPayment,
      message: "Payment cancelled successfully",
    };
  }
}
