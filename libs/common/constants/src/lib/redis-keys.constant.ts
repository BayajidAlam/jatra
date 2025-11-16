/**
 * Redis Key Patterns for the application
 * Used for caching, seat locking, OTP storage, etc.
 */

export const REDIS_KEYS = {
  // Seat Reservation Keys
  SEAT_LOCK: (trainId: string, coachId: string, seatId: string, date: string) =>
    `seat:lock:${trainId}:${coachId}:${seatId}:${date}`,

  SEAT_AVAILABILITY: (trainId: string, scheduleId: string, date: string) =>
    `seat:available:${trainId}:${scheduleId}:${date}`,

  // OTP Keys
  OTP: (phone: string, purpose: string) => `otp:${purpose}:${phone}`,
  OTP_ATTEMPTS: (phone: string) => `otp:attempts:${phone}`,

  // Session Keys
  USER_SESSION: (userId: string) => `session:user:${userId}`,
  REFRESH_TOKEN: (userId: string, tokenId: string) =>
    `token:refresh:${userId}:${tokenId}`,

  // Cache Keys
  TRAIN_SCHEDULE: (trainId: string) => `cache:train:schedule:${trainId}`,
  TRAIN_SEARCH: (from: string, to: string, date: string) =>
    `cache:search:${from}:${to}:${date}`,
  STATION_LIST: "cache:stations:all",
  ROUTE_LIST: "cache:routes:all",

  // Booking Keys
  BOOKING_TEMP: (bookingId: string) => `booking:temp:${bookingId}`,
  PAYMENT_SESSION: (sessionId: string) => `payment:session:${sessionId}`,

  // Rate Limiting Keys
  RATE_LIMIT: (userId: string, endpoint: string) =>
    `ratelimit:${userId}:${endpoint}`,
  RATE_LIMIT_IP: (ip: string, endpoint: string) =>
    `ratelimit:ip:${ip}:${endpoint}`,
} as const;

export const REDIS_TTL = {
  SEAT_LOCK: 300, // 5 minutes
  OTP: 300, // 5 minutes
  OTP_ATTEMPTS: 3600, // 1 hour
  SESSION: 86400, // 24 hours
  REFRESH_TOKEN: 604800, // 7 days
  TRAIN_SCHEDULE: 3600, // 1 hour
  TRAIN_SEARCH: 300, // 5 minutes
  STATION_LIST: 86400, // 24 hours
  BOOKING_TEMP: 900, // 15 minutes
  PAYMENT_SESSION: 1800, // 30 minutes
  RATE_LIMIT: 60, // 1 minute
} as const;
