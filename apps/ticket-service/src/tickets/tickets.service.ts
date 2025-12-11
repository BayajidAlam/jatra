import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { QRCodeService } from "./qrcode.service";
import { PDFService } from "./pdf.service";
import { GenerateTicketDto } from "./dto/generate-ticket.dto";
import { ValidateTicketDto } from "./dto/validate-ticket.dto";

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qrCodeService: QRCodeService,
    private readonly pdfService: PDFService
  ) {}

  /**
   * Generate ticket for confirmed booking
   */
  async generateTicket(dto: GenerateTicketDto) {
    this.logger.log(`Generating ticket for booking ${dto.bookingId}`);

    // Check if ticket already exists
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existingTicket) {
      return this.getTicket(existingTicket.id);
    }

    // Get booking with all details
    const booking: any = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        user: true,
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
        seats: {
          include: {
            seat: {
              include: {
                coach: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException(
        "Booking must be confirmed to generate ticket"
      );
    }

    // Generate ticket number
    const ticketNumber = this.generateTicketNumber();

    // Generate QR code
    const qrData = this.qrCodeService.validateQRData(ticketNumber, booking.id);
    const qrCode = await this.qrCodeService.generateQRCode(qrData);
    const qrCodeBuffer = await this.qrCodeService.generateQRCodeBuffer(qrData);

    // Find from and to stations
    const stops = booking.journey.route.stops.sort(
      (a: any, b: any) => a.stopOrder - b.stopOrder
    );
    const fromStation = stops[0]?.fromStation?.name || "Unknown";
    const toStation = stops[stops.length - 1]?.toStation?.name || "Unknown";

    // Generate PDF
    const pdfUrl = await this.pdfService.generateTicketPDF({
      ticketNumber,
      bookingId: booking.id,
      passengerName: booking.user.name,
      passengerEmail: booking.user.email,
      passengerPhone: booking.user.phone,
      trainName: booking.journey.train.name,
      trainNumber: booking.journey.train.trainNumber,
      fromStation,
      toStation,
      departureTime: booking.journey.departureTime.toLocaleString(),
      arrivalTime: booking.journey.arrivalTime.toLocaleString(),
      journeyDate: booking.journey.journeyDate.toLocaleDateString(),
      seats: booking.seats.map((bs: any) => ({
        seatNumber: bs.seat.seatNumber,
        coach: bs.seat.coach.coachName,
        class: bs.seat.coach.coachClass,
      })),
      totalAmount: booking.totalAmount,
      paymentMethod: booking.payment.paymentMethod,
      qrCodeBuffer,
    });

    // Create ticket record
    const ticket = await this.prisma.ticket.create({
      data: {
        bookingId: booking.id,
        ticketNumber,
        qrCode,
        pdfUrl,
      },
      include: {
        booking: {
          include: {
            journey: {
              include: {
                train: true,
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.log(`✅ Ticket generated: ${ticketNumber}`);

    return ticket;
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
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
                    },
                  },
                },
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true,
                  },
                },
              },
            },
            payment: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  /**
   * Get ticket by booking ID
   */
  async getTicketByBooking(bookingId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
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
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found for this booking");
    }

    return ticket;
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            journey: {
              include: {
                train: true,
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tickets;
  }

  /**
   * Validate ticket for boarding
   */
  async validateTicket(dto: ValidateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber: dto.ticketNumber },
      include: {
        booking: {
          include: {
            journey: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    if (ticket.isValidated) {
      throw new BadRequestException("Ticket already validated");
    }

    if (ticket.booking.status !== "CONFIRMED") {
      throw new BadRequestException("Booking is not confirmed");
    }

    // Update ticket as validated
    const validatedTicket = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isValidated: true,
        validatedAt: new Date(),
        validatedBy: dto.validatedBy,
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            journey: {
              include: {
                train: true,
              },
            },
            seats: {
              include: {
                seat: {
                  include: {
                    coach: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `✅ Ticket validated: ${dto.ticketNumber} by ${dto.validatedBy}`
    );

    return {
      ...validatedTicket,
      message: "Ticket validated successfully. Passenger can board.",
    };
  }

  /**
   * Get QR code for ticket
   */
  async getQRCode(ticketId: string): Promise<string> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket.qrCode;
  }

  /**
   * Get PDF path for download
   */
  async getPDFPath(ticketId: string): Promise<string> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const pdfPath = this.pdfService.getPDFPath(ticket.ticketNumber);
    const exists = await this.pdfService.pdfExists(ticket.ticketNumber);

    if (!exists) {
      throw new NotFoundException("PDF file not found");
    }

    return pdfPath;
  }

  /**
   * Generate unique ticket number
   */
  private generateTicketNumber(): string {
    const prefix = process.env.TICKET_NUMBER_PREFIX || "TKT";
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${date}-${random}`;
  }
}
