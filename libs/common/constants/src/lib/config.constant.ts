/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "7d",
    ALGORITHM: "HS256" as const,
  },

  // OTP Configuration
  OTP: {
    LENGTH: 6,
    EXPIRY_SECONDS: 300,
    MAX_ATTEMPTS: 5,
    RESEND_COOLDOWN: 60,
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Seat Reservation
  SEAT_RESERVATION: {
    HOLD_DURATION_SECONDS: 300, // 5 minutes
    ADVANCE_BOOKING_DAYS: 10,
    MAX_SEATS_PER_BOOKING: 4,
  },

  // Payment
  PAYMENT: {
    CURRENCY: "BDT",
    TIMEOUT_SECONDS: 1800, // 30 minutes
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS: 100,
    STRICT_ENDPOINTS: {
      LOGIN: 5,
      OTP_SEND: 3,
      SEAT_SELECT: 10,
    },
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "application/pdf"],
  },
} as const;

export const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  AUTH_SERVICE: 3001,
  USER_SERVICE: 3002,
  SEARCH_SERVICE: 3003,
  SCHEDULE_SERVICE: 3004,
  SEAT_RESERVATION_SERVICE: 3005,
  BOOKING_SERVICE: 3006,
  PAYMENT_SERVICE: 3007,
  TICKET_SERVICE: 3008,
  NOTIFICATION_SERVICE: 3009,
  ADMIN_SERVICE: 3010,
} as const;

export const DATABASE_CONFIG = {
  POSTGRES: {
    PORT: 5432,
    MAX_CONNECTIONS: 100,
    IDLE_TIMEOUT_MS: 30000,
  },
  REDIS: {
    PORT: 6379,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
  },
  RABBITMQ: {
    PORT: 5672,
    MANAGEMENT_PORT: 15672,
    PREFETCH_COUNT: 10,
  },
} as const;
