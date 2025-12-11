import { Injectable, Logger } from "@nestjs/common";
import * as PDFDocument from "pdfkit";
import { promises as fs } from "fs";
import { join } from "path";

export interface TicketPDFData {
  ticketNumber: string;
  bookingId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  trainName: string;
  trainNumber: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  journeyDate: string;
  seats: Array<{ seatNumber: string; coach: string; class: string }>;
  totalAmount: number;
  paymentMethod: string;
  qrCodeBuffer: Buffer;
}

@Injectable()
export class PDFService {
  private readonly logger = new Logger(PDFService.name);
  private readonly storagePath =
    process.env.TICKET_PDF_STORAGE_PATH || "./storage/tickets";

  /**
   * Generate PDF ticket
   */
  async generateTicketPDF(data: TicketPDFData): Promise<string> {
    try {
      // Ensure storage directory exists
      await fs.mkdir(this.storagePath, { recursive: true });

      const fileName = `${data.ticketNumber}.pdf`;
      const filePath = join(this.storagePath, fileName);

      // Create PDF document
      const doc = new (PDFDocument as any)({ size: "A4", margin: 50 });
      const writeStream = require("fs").createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc
        .fontSize(24)
        .fillColor("#1e40af")
        .text("JATRA RAILWAY", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .fillColor("#000000")
        .text("E-TICKET", { align: "center" })
        .moveDown(1);

      // Ticket Number
      doc
        .fontSize(12)
        .fillColor("#666666")
        .text(`Ticket Number: ${data.ticketNumber}`, { align: "center" })
        .moveDown(2);

      // Journey Details Box
      doc.rect(50, doc.y, 495, 120).stroke("#1e40af");

      const boxStartY = doc.y + 10;
      doc.y = boxStartY;

      doc
        .fontSize(14)
        .fillColor("#000000")
        .text(`Train: ${data.trainName} (${data.trainNumber})`, 60, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`From: ${data.fromStation}`, 60, doc.y)
        .text(`To: ${data.toStation}`, 300, doc.y - 15)
        .moveDown(1);

      doc.text(`Date: ${data.journeyDate}`, 60, doc.y).moveDown(0.5);

      doc
        .text(`Departure: ${data.departureTime}`, 60, doc.y)
        .text(`Arrival: ${data.arrivalTime}`, 300, doc.y - 15)
        .moveDown(2);

      // Passenger Details
      doc
        .fontSize(14)
        .fillColor("#1e40af")
        .text("PASSENGER DETAILS", 50, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#000000")
        .text(`Name: ${data.passengerName}`, 50, doc.y)
        .moveDown(0.5);

      doc.text(`Email: ${data.passengerEmail}`, 50, doc.y).moveDown(0.5);

      doc.text(`Phone: ${data.passengerPhone}`, 50, doc.y).moveDown(2);

      // Seat Details
      doc
        .fontSize(14)
        .fillColor("#1e40af")
        .text("SEAT DETAILS", 50, doc.y)
        .moveDown(0.5);

      data.seats.forEach((seat) => {
        doc
          .fontSize(12)
          .fillColor("#000000")
          .text(
            `Coach: ${seat.coach} | Seat: ${seat.seatNumber} | Class: ${seat.class}`,
            50,
            doc.y
          )
          .moveDown(0.5);
      });

      doc.moveDown(1);

      // Payment Details
      doc
        .fontSize(14)
        .fillColor("#1e40af")
        .text("PAYMENT DETAILS", 50, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#000000")
        .text(`Total Amount: BDT ${data.totalAmount.toFixed(2)}`, 50, doc.y)
        .moveDown(0.5);

      doc.text(`Payment Method: ${data.paymentMethod}`, 50, doc.y).moveDown(2);

      // QR Code
      doc
        .fontSize(14)
        .fillColor("#1e40af")
        .text("SCAN FOR VALIDATION", 50, doc.y, { align: "center" })
        .moveDown(0.5);

      const qrX = (595 - 150) / 2; // Center QR code (A4 width = 595)
      doc.image(data.qrCodeBuffer, qrX, doc.y, { width: 150, height: 150 });

      doc.moveDown(10);

      // Footer
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("Please arrive at the station 30 minutes before departure.", {
          align: "center",
        })
        .moveDown(0.3);

      doc
        .text(
          "This is a computer-generated ticket and does not require a signature.",
          { align: "center" }
        )
        .moveDown(0.3);

      doc.text(`Booking ID: ${data.bookingId}`, { align: "center" });

      doc.end();

      // Wait for write to complete
      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      this.logger.log(`✅ PDF ticket generated: ${fileName}`);

      const urlBase =
        process.env.TICKET_PDF_URL_BASE || "http://localhost:3006/tickets";
      return `${urlBase}/pdf/${fileName}`;
    } catch (error) {
      this.logger.error("Failed to generate PDF ticket", error);
      throw new Error("PDF generation failed");
    }
  }

  /**
   * Check if PDF file exists
   */
  async pdfExists(ticketNumber: string): Promise<boolean> {
    try {
      const filePath = join(this.storagePath, `${ticketNumber}.pdf`);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get PDF file path
   */
  getPDFPath(ticketNumber: string): string {
    return join(this.storagePath, `${ticketNumber}.pdf`);
  }
}
