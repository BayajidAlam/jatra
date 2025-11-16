/**
 * Event Names for RabbitMQ Message Queue
 */

export const EVENTS = {
  // Booking Events
  BOOKING_CREATED: "booking.created",
  BOOKING_CONFIRMED: "booking.confirmed",
  BOOKING_CANCELLED: "booking.cancelled",
  BOOKING_EXPIRED: "booking.expired",

  // Seat Reservation Events
  SEAT_RESERVED: "seat.reserved",
  SEAT_RELEASED: "seat.released",
  SEAT_EXPIRED: "seat.expired",

  // Payment Events
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CANCELLED: "payment.cancelled",

  // Ticket Events
  TICKET_GENERATED: "ticket.generated",
  TICKET_VALIDATED: "ticket.validated",
  TICKET_CANCELLED: "ticket.cancelled",

  // Notification Events
  SEND_OTP: "notification.otp.send",
  SEND_EMAIL: "notification.email.send",
  SEND_SMS: "notification.sms.send",
  SEND_BOOKING_CONFIRMATION: "notification.booking.confirmation",

  // User Events
  USER_REGISTERED: "user.registered",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",

  // Admin Events
  TRAIN_CREATED: "admin.train.created",
  TRAIN_UPDATED: "admin.train.updated",
  SCHEDULE_UPDATED: "admin.schedule.updated",
} as const;

export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications_queue",
  BOOKINGS: "bookings_queue",
  PAYMENTS: "payments_queue",
  TICKETS: "tickets_queue",
  ANALYTICS: "analytics_queue",
} as const;

export const EXCHANGE_NAMES = {
  BOOKING: "booking_exchange",
  NOTIFICATION: "notification_exchange",
  PAYMENT: "payment_exchange",
  TICKET: "ticket_exchange",
} as const;
