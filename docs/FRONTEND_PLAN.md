# Frontend Development Plan — Jatra Railway Booking System

**Status:** Phase 0 Planning  
**Tech Stack:** Next.js 14 | TypeScript | Tailwind CSS | shadcn/ui | React Query | Zustand  
**Location:** `apps/web/`  
**Branch:** `frontend` (Romana-58 account)

---

## Project Phases

| Phase | Feature                                               | Status  |
| ----- | ----------------------------------------------------- | ------- |
| **0** | Next.js scaffold, Tailwind, shadcn/ui, Axios setup    | Current |
| **1** | Auth (login, signup, refresh, protected routes)       | Pending |
| **2** | Search & Browse (train search, filters)               | Pending |
| **3** | Seat Selection (interactive seats, reservation locks) | Pending |
| **4** | Booking & Payment (checkout, payment gateway)         | Pending |
| **5** | Admin Dashboard (stats, booking mgmt, train CRUD)     | Pending |
| **6** | User Profile & History                                | Pending |

---

## Folder Structure (Hybrid Colocated + Shared)

```
apps/web/
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
│
├── public/
│   ├── favicon.ico
│   └── images/
│
└── src/
    ├── app/                            # Next.js App Router
    │   ├── layout.tsx                  # Root layout
    │   ├── page.tsx                    # Home
    │   ├── globals.css
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── (protected)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── my-bookings/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── BookingHistoryList.tsx
    │   │   │   │   └── BookingFilters.tsx
    │   │   │   └── hooks/useMyBookings.ts
    │   │   ├── search/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── SearchForm.tsx
    │   │   │   │   ├── FilterPanel.tsx
    │   │   │   │   └── ResultsList.tsx
    │   │   │   └── hooks/useTrainSearch.ts
    │   │   ├── seats/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── SeatMap.tsx
    │   │   │   │   ├── SeatLegend.tsx
    │   │   │   │   └── SeatSelector.tsx
    │   │   │   └── hooks/useReservation.ts
    │   │   ├── checkout/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/CheckoutSummary.tsx
    │   │   │   └── hooks/useCheckout.ts
    │   │   ├── payment/
    │   │   │   ├── page.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── PaymentForm.tsx
    │   │   │   │   └── PaymentStatus.tsx
    │   │   │   └── hooks/usePayment.ts
    │   │   ├── confirmation/page.tsx
    │   │   └── profile/
    │   │       ├── page.tsx
    │   │       ├── components/ProfileForm.tsx
    │   │       └── hooks/useProfile.ts
    │   └── admin/
    │       ├── layout.tsx
    │       ├── dashboard/
    │       │   ├── page.tsx
    │       │   ├── components/
    │       │   │   ├── DashboardStats.tsx
    │       │   │   └── RevenueChart.tsx
    │       │   └── hooks/useDashboard.ts
    │       ├── bookings/
    │       │   ├── page.tsx
    │       │   ├── components/
    │       │   │   ├── AdminBookingTable.tsx
    │       │   │   ├── BookingDetailModal.tsx
    │       │   │   └── RefundDialog.tsx
    │       │   └── hooks/useAdminBookings.ts
    │       ├── trains/
    │       │   ├── page.tsx
    │       │   ├── components/
    │       │   │   ├── TrainTable.tsx
    │       │   │   ├── TrainForm.tsx
    │       │   │   └── TrainDeleteModal.tsx
    │       │   └── hooks/useTrains.ts
    │       └── schedule/
    │           ├── page.tsx
    │           ├── components/
    │           │   ├── ScheduleBuilder.tsx
    │           │   └── ScheduleCalendar.tsx
    │           └── hooks/useSchedule.ts
    │
    ├── components/                     # Shared components
    │   ├── common/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Loading.tsx
    │   │   └── ErrorBoundary.tsx
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── SignupForm.tsx
    │   │   └── AuthGuard.tsx
    │   ├── booking/
    │   │   ├── BookingCard.tsx
    │   │   ├── BookingSummary.tsx
    │   │   └── ConfirmationCard.tsx
    │   ├── search/
    │   │   └── TrainCard.tsx
    │   └── ui/
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── card.tsx
    │       └── ... (shadcn/ui)
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useRefreshToken.ts
    │   └── useDebounce.ts
    │
    ├── stores/
    │   ├── authStore.ts
    │   └── bookingStore.ts
    │
    ├── lib/
    │   ├── axios-client.ts
    │   ├── api-endpoints.ts
    │   ├── queryClient.ts
    │   ├── validators.ts
    │   ├── utils.ts
    │   └── constants.ts
    │
    └── types/
        ├── auth.ts
        ├── journey.ts
        ├── booking.ts
        ├── payment.ts
        └── api.ts
```

---

## Backend API Services & Endpoints (11 Services)

### 1. Auth Service

| Method | Endpoint                | Purpose                                         | Auth |
| ------ | ----------------------- | ----------------------------------------------- | ---- |
| POST   | `/auth/register`        | User signup (email, password, phone, NID, name) | No   |
| POST   | `/auth/login`           | User login (email/phone, password)              | No   |
| GET    | `/auth/me`              | Get current user profile                        | Yes  |
| POST   | `/auth/refresh`         | Refresh access token                            | No   |
| POST   | `/auth/logout`          | Logout user                                     | Yes  |
| PATCH  | `/auth/profile`         | Update profile (name, email, phone)             | Yes  |
| POST   | `/auth/change-password` | Change password                                 | Yes  |
| POST   | `/auth/forgot-password` | Request password reset                          | No   |
| POST   | `/auth/reset-password`  | Reset password with token                       | No   |

### 2. Schedule Service

| Method | Endpoint                 | Purpose                                      | Auth |
| ------ | ------------------------ | -------------------------------------------- | ---- |
| GET    | `/schedule/stations`     | List all stations                            | No   |
| GET    | `/schedule/stations/:id` | Get station details                          | No   |
| POST   | `/schedule/stations`     | Create station (admin)                       | Yes  |
| PATCH  | `/schedule/stations/:id` | Update station (admin)                       | Yes  |
| DELETE | `/schedule/stations/:id` | Delete station (admin)                       | Yes  |
| GET    | `/schedule/trains`       | List all trains                              | No   |
| GET    | `/schedule/trains/:id`   | Get train details                            | No   |
| POST   | `/schedule/trains`       | Create train (admin)                         | Yes  |
| PATCH  | `/schedule/trains/:id`   | Update train (admin)                         | Yes  |
| DELETE | `/schedule/trains/:id`   | Delete train (admin)                         | Yes  |
| GET    | `/schedule/journeys`     | Search journeys (from, to, date, passengers) | No   |
| GET    | `/schedule/journeys/:id` | Get journey details                          | No   |
| POST   | `/schedule/journeys`     | Create journey/schedule (admin)              | Yes  |
| PATCH  | `/schedule/journeys/:id` | Update journey (admin)                       | Yes  |
| DELETE | `/schedule/journeys/:id` | Cancel journey (admin)                       | Yes  |

### 3. Seat Reservation Service

| Method | Endpoint                             | Purpose                             | Auth |
| ------ | ------------------------------------ | ----------------------------------- | ---- |
| GET    | `/seat-reservation/seats?journeyId=` | Get available seats for journey     | No   |
| GET    | `/seat-reservation/seats/:id`        | Get seat details                    | No   |
| POST   | `/seat-reservation/reserve`          | Reserve seat (5-min temporary lock) | Yes  |
| POST   | `/seat-reservation/release`          | Release reserved seat               | Yes  |
| GET    | `/seat-reservation/my-reservations`  | Get user's active reservations      | Yes  |
| DELETE | `/seat-reservation/reserve/:id`      | Cancel reservation                  | Yes  |
| POST   | `/seat-reservation/check`            | Check seat real-time availability   | No   |

### 4. Booking Service

| Method | Endpoint                     | Purpose                                 | Auth |
| ------ | ---------------------------- | --------------------------------------- | ---- |
| POST   | `/booking/create`            | Create booking (with passenger details) | Yes  |
| GET    | `/booking/my-bookings`       | Get user's bookings (past & upcoming)   | Yes  |
| GET    | `/booking/:id`               | Get booking details with ticket info    | Yes  |
| POST   | `/booking/:id/confirm`       | Confirm booking (after payment)         | Yes  |
| PATCH  | `/booking/:id/cancel`        | Cancel booking with refund logic        | Yes  |
| PATCH  | `/booking/:id/status`        | Update booking status (admin)           | Yes  |
| GET    | `/booking/search`            | Search bookings by criteria (admin)     | Yes  |
| POST   | `/booking/:id/resend-ticket` | Resend ticket email                     | Yes  |

### 5. Payment Service

| Method | Endpoint               | Purpose                                     | Auth |
| ------ | ---------------------- | ------------------------------------------- | ---- |
| POST   | `/payments/initiate`   | Start payment (Stripe/SSLCommerz)           | Yes  |
| GET    | `/payments/status/:id` | Check payment status                        | Yes  |
| POST   | `/payments/confirm`    | Confirm payment completion                  | Yes  |
| POST   | `/payments/refund`     | Process refund                              | Yes  |
| GET    | `/payments/history`    | Get user's payment history                  | Yes  |
| POST   | `/payments/webhook`    | Payment gateway webhook (Stripe/SSLCommerz) | No   |
| GET    | `/payments/methods`    | Get available payment methods               | No   |

### 6. Ticket Service

| Method | Endpoint                      | Purpose                        | Auth |
| ------ | ----------------------------- | ------------------------------ | ---- |
| GET    | `/tickets/:id`                | Get ticket details (PDF-ready) | Yes  |
| POST   | `/tickets/:id/download`       | Download ticket as PDF         | Yes  |
| POST   | `/tickets/:id/send`           | Send ticket via email/SMS      | Yes  |
| GET    | `/tickets/booking/:bookingId` | Get tickets for booking        | Yes  |
| POST   | `/tickets/validate`           | Validate ticket (QR code scan) | No   |
| GET    | `/tickets/:id/qr`             | Get QR code image              | Yes  |

### 7. Notification Service

| Method | Endpoint                     | Purpose                           | Auth     |
| ------ | ---------------------------- | --------------------------------- | -------- |
| POST   | `/notifications/email`       | Send email notification (backend) | Internal |
| POST   | `/notifications/sms`         | Send SMS notification (backend)   | Internal |
| POST   | `/notifications/push`        | Send push notification (backend)  | Internal |
| GET    | `/notifications/preferences` | Get user notification preferences | Yes      |
| PATCH  | `/notifications/preferences` | Update notification preferences   | Yes      |
| GET    | `/notifications/history`     | Get notification history          | Yes      |

### 8. Search Service

| Method | Endpoint              | Purpose                                  | Auth |
| ------ | --------------------- | ---------------------------------------- | ---- |
| GET    | `/search/journeys`    | Advanced journey search (cached results) | No   |
| GET    | `/search/suggestions` | Auto-complete station suggestions        | No   |
| POST   | `/search/recent`      | Get user's recent searches               | Yes  |
| GET    | `/search/popular`     | Get popular routes                       | No   |
| GET    | `/search/filters`     | Get available filter options             | No   |

### 9. User Service

| Method | Endpoint                          | Purpose                         | Auth |
| ------ | --------------------------------- | ------------------------------- | ---- |
| GET    | `/users/:id`                      | Get user profile                | Yes  |
| PATCH  | `/users/:id`                      | Update user profile             | Yes  |
| POST   | `/users/:id/avatar`               | Upload profile picture          | Yes  |
| GET    | `/users/:id/bookings`             | Get user's bookings (paginated) | Yes  |
| POST   | `/users/:id/favorites`            | Add favorite route              | Yes  |
| DELETE | `/users/:id/favorites/:routeId`   | Remove favorite                 | Yes  |
| GET    | `/users/:id/favorites`            | Get favorite routes             | Yes  |
| POST   | `/users/:id/addresses`            | Add saved address               | Yes  |
| GET    | `/users/:id/addresses`            | Get saved addresses             | Yes  |
| DELETE | `/users/:id/addresses/:addressId` | Delete address                  | Yes  |

### 10. Reporting Service

| Method | Endpoint               | Purpose                               | Auth        |
| ------ | ---------------------- | ------------------------------------- | ----------- |
| GET    | `/reporting/dashboard` | Admin dashboard stats                 | Yes (admin) |
| GET    | `/reporting/revenue`   | Revenue report (by date, route, etc.) | Yes (admin) |
| GET    | `/reporting/occupancy` | Occupancy report                      | Yes (admin) |
| GET    | `/reporting/bookings`  | Booking analytics                     | Yes (admin) |
| GET    | `/reporting/users`     | User analytics                        | Yes (admin) |
| GET    | `/reporting/export`    | Export reports (CSV/Excel)            | Yes (admin) |

### 11. Admin Service

| Method | Endpoint                     | Purpose                                   | Auth        |
| ------ | ---------------------------- | ----------------------------------------- | ----------- |
| GET    | `/admin/dashboard`           | Admin dashboard overview                  | Yes (admin) |
| GET    | `/admin/bookings`            | List all bookings (filterable, paginated) | Yes (admin) |
| GET    | `/admin/bookings/:id`        | Booking details                           | Yes (admin) |
| PATCH  | `/admin/bookings/:id`        | Modify booking (admin)                    | Yes (admin) |
| POST   | `/admin/bookings/:id/refund` | Process refund (admin)                    | Yes (admin) |
| DELETE | `/admin/bookings/:id`        | Delete booking (admin)                    | Yes (admin) |
| GET    | `/admin/users`               | List all users                            | Yes (admin) |
| GET    | `/admin/users/:id`           | User details                              | Yes (admin) |
| PATCH  | `/admin/users/:id`           | Update user (admin)                       | Yes (admin) |
| POST   | `/admin/users/:id/block`     | Block user                                | Yes (admin) |
| DELETE | `/admin/users/:id`           | Delete user (admin)                       | Yes (admin) |
| GET    | `/admin/trains`              | Manage trains                             | Yes (admin) |
| POST   | `/admin/trains`              | Create train                              | Yes (admin) |
| PATCH  | `/admin/trains/:id`          | Update train                              | Yes (admin) |
| DELETE | `/admin/trains/:id`          | Delete train                              | Yes (admin) |
| GET    | `/admin/routes`              | Manage routes                             | Yes (admin) |
| POST   | `/admin/routes`              | Create route                              | Yes (admin) |
| PATCH  | `/admin/routes/:id`          | Update route                              | Yes (admin) |
| DELETE | `/admin/routes/:id`          | Delete route                              | Yes (admin) |
| GET    | `/admin/settings`            | App settings                              | Yes (admin) |
| PATCH  | `/admin/settings`            | Update settings                           | Yes (admin) |
| POST   | `/admin/notifications/send`  | Send bulk notification                    | Yes (admin) |

---

## Authentication & Cookies

### Cookie Structure

- **accessToken**: 15 min expiry, HttpOnly, Secure, SameSite=strict
- **refreshToken**: 7 day expiry, HttpOnly, Secure, SameSite=strict

### Frontend Setup (Axios)

```typescript
// Always include credentials
axios.create({
  baseURL: "http://localhost:30000/api/v1",
  withCredentials: true,
});
```

### Token Refresh Interceptor

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // POST /auth/refresh
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

---

## Tech Stack Details

### Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "axios": "1.x",
  "@tanstack/react-query": "5.x",
  "zustand": "4.x",
  "react-hook-form": "7.x",
  "zod": "3.x",
  "tailwindcss": "3.x"
}
```

### State Management

- **Zustand**: Auth state, booking cart, UI state
- **React Query**: API caching, journeys, payments, bookings

### Protected Routes

- Route groups `(protected)` require AuthGuard
- `(auth)` routes for login/signup (redirect if already authenticated)
- `admin/` routes (unprotected or role-based)

---

## Phase 0: Scaffold Checklist

- [ ] Create Next.js 14 app with TypeScript
- [ ] Install Tailwind CSS + shadcn/ui
- [ ] Setup Axios client (`lib/axios-client.ts`)
- [ ] Setup API endpoints (`lib/api-endpoints.ts`)
- [ ] Create TypeScript types (`types/`)
- [ ] Create root layout + home page
- [ ] Create Navbar, Footer, Sidebar components
- [ ] Setup Zustand auth store
- [ ] Setup React Query
- [ ] Test dev server (`pnpm dev`)
- [ ] Commit and push to `frontend` branch

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build production
pnpm build

# Start production
pnpm start

# Lint
pnpm lint
```

---

## Notes

- API Gateway running on port 30000
- Frontend dev server on port 3000
- All API calls use `withCredentials: true`
- Token refresh is automatic (interceptor)
- Component colocating reduces file nesting
- Shared components in `components/` for reuse

---

**Created:** Dec 26, 2025  
**Account:** Romana-58  
**Status:** Ready for Phase 0 Scaffolding
