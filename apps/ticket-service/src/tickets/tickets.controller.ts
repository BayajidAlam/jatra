import { Controller, Post, Get, Body, Param, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TicketsService } from './tickets.service';
import { GenerateTicketDto } from './dto/generate-ticket.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Generate ticket for confirmed booking',
    description: 'Creates ticket with QR code and PDF for a confirmed booking'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ticket generated successfully',
    example: {
      id: 'ticket-uuid',
      ticketNumber: 'TKT-20251122-12345',
      bookingId: 'booking-uuid',
      qrCode: 'data:image/png;base64,...',
      pdfUrl: 'http://localhost:3006/tickets/pdf/TKT-20251122-12345.pdf',
      isValidated: false,
      createdAt: '2025-11-22T00:00:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Booking not confirmed' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async generateTicket(@Body() dto: GenerateTicketDto) {
    return this.ticketsService.generateTicket(dto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get ticket by ID',
    description: 'Returns ticket details with booking and journey information'
  })
  @ApiResponse({ status: 200, description: 'Ticket details retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') ticketId: string) {
    return this.ticketsService.getTicket(ticketId);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ 
    summary: 'Get ticket by booking ID',
    description: 'Returns ticket for a specific booking'
  })
  @ApiResponse({ status: 200, description: 'Ticket retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketByBooking(@Param('bookingId') bookingId: string) {
    return this.ticketsService.getTicketByBooking(bookingId);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get user tickets',
    description: 'Returns all tickets for a specific user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User tickets retrieved',
    example: [
      {
        id: 'ticket-uuid',
        ticketNumber: 'TKT-20251122-12345',
        isValidated: false,
        booking: {}
      }
    ]
  })
  async getUserTickets(@Param('userId') userId: string) {
    return this.ticketsService.getUserTickets(userId);
  }

  @Get(':id/qr')
  @ApiOperation({ 
    summary: 'Get QR code',
    description: 'Returns QR code image as Base64 data URL'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'QR code retrieved',
    example: {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
    }
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getQRCode(@Param('id') ticketId: string) {
    const qrCode = await this.ticketsService.getQRCode(ticketId);
    return { qrCode };
  }

  @Get(':id/pdf')
  @ApiOperation({ 
    summary: 'Download PDF ticket',
    description: 'Returns PDF file for download'
  })
  @ApiResponse({ status: 200, description: 'PDF file', type: 'application/pdf' })
  @ApiResponse({ status: 404, description: 'Ticket or PDF not found' })
  async downloadPDF(@Param('id') ticketId: string, @Res() res: Response) {
    const pdfPath = await this.ticketsService.getPDFPath(ticketId);
    res.download(pdfPath);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validate ticket for boarding',
    description: 'Marks ticket as validated and allows passenger to board'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket validated successfully',
    example: {
      id: 'ticket-uuid',
      ticketNumber: 'TKT-20251122-12345',
      isValidated: true,
      validatedAt: '2025-11-22T08:00:00Z',
      validatedBy: 'staff-001',
      message: 'Ticket validated successfully. Passenger can board.'
    }
  })
  @ApiResponse({ status: 400, description: 'Ticket already validated or booking not confirmed' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async validateTicket(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.validateTicket(dto);
  }
}
