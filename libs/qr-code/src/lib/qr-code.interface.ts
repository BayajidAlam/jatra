export interface QRCodeData {
  ticketId: string;
  pnr: string;
  bookingId: string;
  trainName: string;
  journeyDate: string;
  passengerName: string;
  seatNumber: string;
  signature: string; // HMAC signature for verification
}

export interface QRCodeOptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  type?: "image/png" | "image/jpeg";
  quality?: number;
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QRCodeResult {
  dataUrl: string; // Base64 encoded QR code
  buffer?: any; // Buffer type
  svg?: string;
}

export interface QRCodeVerification {
  isValid: boolean;
  data?: QRCodeData;
  error?: string;
}
