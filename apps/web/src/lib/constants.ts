export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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
    REFRESH: "/auth/refresh-token",
  },
  SCHEDULE: {
    JOURNEYS: "/journeys",
    STATIONS: "/stations",
    TRAINS: "/trains",
    SEARCH: "/search/journeys",
  },
  BOOKING: {
    CREATE: "/bookings/create",
    MY_BOOKINGS: "/bookings",
    DETAILS: (id: string) => `/bookings/${id}`,
  },
  SEAT_RESERVATION: {
    SEATS: "/locks/check",
    RESERVE: "/locks/acquire",
    RELEASE: "/locks/release",
  },
  PAYMENT: {
    INITIATE: "/payments/initiate",
    STATUS: (id: string) => `/gateway/status/${id}`,
    CONFIRM: "/payments/confirm",
  },
  TICKET: {
    DETAILS: (id: string) => `/tickets/${id}`,
    DOWNLOAD: (id: string) => `/tickets/${id}/pdf`,
  },
  ADMIN: {
    USERS: "/admin/users",
    TRAINS: "/admin/trains",
    STATIONS: "/admin/stations",
    ROUTES: "/admin/routes",
    JOURNEYS: "/admin/journeys",
    BOOKINGS: "/admin/bookings",
    COACHES: "/admin/coaches",
    SEATS: "/admin/seats",
    PAYMENTS: "/admin/payments",
    SETTINGS: "/admin/settings",
    STATS: "/admin/stats/dashboard",
  },
} as const;
