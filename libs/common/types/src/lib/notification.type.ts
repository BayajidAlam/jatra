export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string; // email or phone
  subject?: string;
  message: string;
  status: NotificationStatus;
  sentAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  OTP = "OTP",
  BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  TICKET_GENERATED = "TICKET_GENERATED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  SEAT_EXPIRY_WARNING = "SEAT_EXPIRY_WARNING",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  BOTH = "BOTH",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  RETRY = "RETRY",
}

export interface OTPNotification {
  phone: string;
  email?: string;
  otp: string;
  expiresIn: number; // seconds
  purpose: "LOGIN" | "REGISTRATION" | "BOOKING_VERIFICATION";
}

export interface BookingNotification {
  bookingId: string;
  pnr: string;
  trainName: string;
  journeyDate: string;
  passengers: string[];
  totalAmount: number;
}
