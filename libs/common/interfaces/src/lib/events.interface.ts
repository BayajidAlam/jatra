// Base event interface
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  source: string;
}

// Booking Events
export interface BookingCreatedEvent extends BaseEvent {
  eventType: 'booking.created';
  data: {
    bookingId: string;
    userId: string;
    journeyId: string;
    reservationId: string;
    paymentId: string;
    totalAmount: number;
    seatIds: string[];
  };
}

export interface BookingConfirmedEvent extends BaseEvent {
  eventType: 'booking.confirmed';
  data: {
    bookingId: string;
    userId: string;
    email: string;
    phone?: string;
    journeyId: string;
    totalAmount: number;
    seats: Array<{
      seatId: string;
      seatNumber: string;
      coachNumber: string;
    }>;
    journey: {
      trainName: string;
      trainNumber: string;
      departureTime: Date;
      arrivalTime: Date;
      fromStation: string;
      toStation: string;
    };
    ticketNumber?: string;
    pdfUrl?: string;
  };
}

export interface BookingCancelledEvent extends BaseEvent {
  eventType: 'booking.cancelled';
  data: {
    bookingId: string;
    userId: string;
    reservationId: string;
    paymentId: string;
    refundAmount: number;
    reason?: string;
  };
}

// Payment Events
export interface PaymentInitiatedEvent extends BaseEvent {
  eventType: 'payment.initiated';
  data: {
    paymentId: string;
    userId: string;
    reservationId: string;
    amount: number;
    paymentMethod: string;
  };
}

export interface PaymentCompletedEvent extends BaseEvent {
  eventType: 'payment.completed';
  data: {
    paymentId: string;
    userId: string;
    reservationId: string;
    bookingId?: string;
    amount: number;
    transactionId: string;
    paymentMethod: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  eventType: 'payment.failed';
  data: {
    paymentId: string;
    userId: string;
    reservationId: string;
    bookingId?: string;
    amount: number;
    reason: string;
    errorCode?: string;
  };
}

export interface RefundInitiatedEvent extends BaseEvent {
  eventType: 'refund.initiated';
  data: {
    refundId: string;
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
  };
}

export interface RefundCompletedEvent extends BaseEvent {
  eventType: 'refund.completed';
  data: {
    refundId: string;
    paymentId: string;
    bookingId: string;
    userId: string;
    amount: number;
    transactionId: string;
  };
}

// Ticket Events
export interface TicketGeneratedEvent extends BaseEvent {
  eventType: 'ticket.generated';
  data: {
    ticketId: string;
    bookingId: string;
    userId: string;
    pnr: string;
    qrCode: string;
  };
}

export interface TicketCancelledEvent extends BaseEvent {
  eventType: 'ticket.cancelled';
  data: {
    ticketId: string;
    bookingId: string;
    pnr: string;
  };
}

// Reservation Events
export interface SeatsLockedEvent extends BaseEvent {
  eventType: 'seats.locked';
  data: {
    reservationId: string;
    userId: string;
    journeyId: string;
    seatIds: string[];
    expiresAt: Date;
  };
}

export interface SeatsReleasedEvent extends BaseEvent {
  eventType: 'seats.released';
  data: {
    reservationId: string;
    userId: string;
    seatIds: string[];
    reason: 'expired' | 'cancelled' | 'payment_failed';
  };
}

export interface ReservationConfirmedEvent extends BaseEvent {
  eventType: 'reservation.confirmed';
  data: {
    reservationId: string;
    userId: string;
    bookingId: string;
    seatIds: string[];
  };
}

// Notification Events
export interface SendEmailEvent extends BaseEvent {
  eventType: 'notification.send_email';
  data: {
    userId?: string;
    to: string;
    subject: string;
    template: 'booking_confirmation' | 'payment_success' | 'ticket_generated' | 'booking_cancelled' | 'payment_failed' | 'ticket-email';
    context: Record<string, any>;
  };
}

export interface SendSMSEvent extends BaseEvent {
  eventType: 'notification.send_sms';
  data: {
    to: string;
    message: string;
    template?: 'booking_confirmation' | 'ticket_generated';
    context?: Record<string, any>;
  };
}

// Schedule/Train Events
export interface TrainUpdateEvent extends BaseEvent {
  eventType: 'train.updated';
  data: {
    journeyId?: string; // Optional because train cancellation might affect multiple journeys? No, usually specific.
    trainId: string;
    trainName: string;
    trainNumber: string;
    updateType: 'DELAY' | 'CANCEL' | 'RESCHEDULE';
    delayMinutes?: number;
    newDepartureTime?: Date;
    reason?: string;
  };
}

// Union type of all events
export type DomainEvent =
  | BookingCreatedEvent
  | BookingConfirmedEvent
  | BookingCancelledEvent
  | PaymentInitiatedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | RefundInitiatedEvent
  | RefundCompletedEvent
  | TicketGeneratedEvent
  | TicketCancelledEvent
  | SeatsLockedEvent
  | SeatsReleasedEvent
  | ReservationConfirmedEvent
  | SendEmailEvent
  | SendSMSEvent
  | TrainUpdateEvent;

// Event routing keys for RabbitMQ
export const EventRoutingKeys = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELLED: 'booking.cancelled',
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_INITIATED: 'refund.initiated',
  REFUND_COMPLETED: 'refund.completed',
  TICKET_GENERATED: 'ticket.generated',
  TICKET_CANCELLED: 'ticket.cancelled',
  SEATS_LOCKED: 'seats.locked',
  SEATS_RELEASED: 'seats.released',
  RESERVATION_CONFIRMED: 'reservation.confirmed',
  SEND_EMAIL: 'notification.send_email',
  SEND_SMS: 'notification.send_sms',
  TRAIN_UPDATED: 'train.updated',
} as const;

// Exchange names
export const Exchanges = {
  BOOKING: 'booking.exchange',
  PAYMENT: 'payment.exchange',
  TICKET: 'ticket.exchange',
  RESERVATION: 'reservation.exchange',
  NOTIFICATION: 'notification.exchange',
  TRAIN: 'train.exchange',
} as const;

// Queue names
export const Queues = {
  BOOKING_EVENTS: 'booking.events',
  PAYMENT_EVENTS: 'payment.events',
  TICKET_EVENTS: 'ticket.events',
  RESERVATION_EVENTS: 'reservation.events',
  NOTIFICATION_EMAIL: 'notification.email',
  NOTIFICATION_SMS: 'notification.sms',
  TRAIN_EVENTS: 'train.events',
} as const;
