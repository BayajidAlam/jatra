export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  SEARCH: "/search",
  MY_BOOKINGS: "/my-bookings",
  PROFILE: "/profile",
  ADMIN: "/admin",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  SCHEDULE: {
    JOURNEYS: "/schedule/journeys",
    STATIONS: "/schedule/stations",
    TRAINS: "/schedule/trains",
  },
  BOOKING: {
    CREATE: "/booking/create",
    MY_BOOKINGS: "/booking/my-bookings",
    DETAILS: (id: string) => `/booking/${id}`,
  },
  SEAT_RESERVATION: {
    SEATS: "/seat-reservation/seats",
    RESERVE: "/seat-reservation/reserve",
    RELEASE: "/seat-reservation/release",
  },
  PAYMENT: {
    INITIATE: "/payments/initiate",
    STATUS: (id: string) => `/payments/status/${id}`,
    CONFIRM: "/payments/confirm",
  },
  TICKET: {
    DETAILS: (id: string) => `/tickets/${id}`,
    DOWNLOAD: (id: string) => `/tickets/${id}/download`,
  },
} as const;
