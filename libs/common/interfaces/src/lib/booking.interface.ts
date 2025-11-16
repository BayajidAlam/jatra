export interface Booking {
  id: string;
  userId: string;
  trainId: string;
  scheduleId: string;
  journeyDate: Date;
  bookingDate: Date;
  status: BookingStatus;
  totalAmount: number;
  paymentId?: string;
  passengers: BookingPassenger[];
  seats: BookingSeat[];
}

export enum BookingStatus {
  PENDING = "PENDING",
  SEAT_RESERVED = "SEAT_RESERVED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface BookingPassenger {
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  seatNumber: string;
  coachNumber: string;
}

export interface BookingSeat {
  seatId: string;
  coachId: string;
  seatNumber: string;
  coachNumber: string;
  fare: number;
  passengerId: string;
}

export interface SeatReservation {
  trainId: string;
  scheduleId: string;
  coachId: string;
  seatId: string;
  journeyDate: string; // Format: YYYY-MM-DD
  userId: string;
  bookingId?: string;
  expiresAt: Date;
  status: "RESERVED" | "CONFIRMED" | "RELEASED";
}
