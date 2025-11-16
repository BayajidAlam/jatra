export interface Ticket {
  id: string;
  bookingId: string;
  userId: string;
  pnr: string; // Passenger Name Record
  qrCode: string; // Base64 encoded QR code
  qrCodeUrl?: string;
  status: TicketStatus;
  validFrom: Date;
  validUntil: Date;
  issuedAt: Date;
}

export enum TicketStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface TicketValidation {
  ticketId: string;
  pnr: string;
  isValid: boolean;
  validatedAt: Date;
  validatedBy?: string;
  reason?: string;
}
