# Jatra Railway - Project Context for AI Assistants

**Last Updated:** November 19, 2025  
**Project Status:** Phase 2 Implementation (In Progress)

## Project Overview

**Jatra** is a microservices-based railway ticketing system for Bangladesh Railway, designed to solve critical issues with the current system (Shohoz):

- Frequent downtime during peak booking times
- Unfair seat allocation (double booking, crashes)
- No observability or monitoring
- Poor scalability

## Tech Stack

### Backend

- **Framework:** NestJS (Node.js/TypeScript)
- **Monorepo:** Nx
- **Database:** PostgreSQL (one per service)
- **Cache & Seat Locking:** Redis
- **Message Queue:** RabbitMQ (inter-service communication only)
- **ORM:** Prisma
- **Authentication:** JWT (access + refresh tokens)
- **API Documentation:** Swagger/OpenAPI

### Infrastructure

- **Containerization:** Docker
- **Orchestration:** Kubernetes (planned)
- **CI/CD:** GitHub Actions (planned)

## Project Structure

```
jatra-railway/
├── apps/                    # Microservices
│   ├── auth-service/        # ✅ COMPLETED
│   ├── schedule-service/    # 🚧 Next
│   ├── seat-service/        # Pending
│   ├── booking-service/     # Pending
│   ├── payment-service/     # Pending
│   ├── ticket-service/      # Pending
│   ├── notification-service/# Pending
│   └── api-gateway/         # Pending
├── libs/                    # Shared libraries
│   ├── common/             # DTOs, interfaces, types, utils
│   ├── database/           # Prisma schemas, DB clients
│   ├── messaging/          # RabbitMQ client
│   ├── qr-code/           # QR generation
│   ├── sms/               # SMS integration
│   └── telemetry/         # OpenTelemetry
├── docs/                   # Documentation
├── infra/                  # Infrastructure configs
└── docker-compose.yml      # Local development

```

## Phase 2: Backend Implementation Status

### ✅ Completed Services

#### 1. Auth & User Service (`apps/auth-service`)

**Port:** 3001  
**Database:** Uses shared Prisma schema in `libs/database/prisma/schema.prisma`

**Features:**

- NID-based registration (Bangladesh National ID: 10 or 13 digits - REQUIRED)
- Email validation (required)
- Phone validation (Bangladesh format: +880 or 01... - REQUIRED)
- Password validation (min 8 chars, uppercase, lowercase, number)
- JWT authentication (access token: 15m, refresh token: 7d)
- Refresh token storage in Postgres (planned migration to Redis)
- Login via NID, email, OR phone
- User profile management

**Endpoints:**

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with identifier + password
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token
- `GET /users/me` - Get current user profile (JWT protected)
- `PATCH /users/me` - Update profile (JWT protected)

**Swagger Documentation:** http://localhost:3001/api/docs

**Prisma Models:**

```prisma
model User {
  id            String         @id @default(uuid())
  nid           String         @unique // 10 or 13 digits
  email         String         @unique
  phone         String         @unique // BD format
  passwordHash  String
  name          String
  role          Role           @default(USER)
  emailVerified Boolean        @default(false)
  phoneVerified Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

### 🚧 In Progress

#### 2. Schedule/Search Service (`apps/schedule-service`)

**Port:** 3002 (planned)  
**Status:** Starting implementation

**Planned Features:**

- Train, station, route, journey management
- Search trains by from/to/date
- Get journey details with seat availability

**Planned Endpoints:**

- `GET /trains?from=&to=&date=` - Search trains
- `GET /trains/:trainId` - Train details
- `GET /trains/:trainId/journeys?date=` - Get journeys
- `GET /journeys/:journeyId` - Journey details

### ⏳ Pending Services

#### 3. Seat/Reservation Service (`apps/seat-service`)

**Key Innovation:** Redis-based atomic seat locking using `SET key value NX EX ttl`

**Planned Features:**

- Lock seats for limited time (e.g., 10 minutes)
- Prevent double booking
- Auto-release expired locks

**Endpoints:**

- `POST /locks` - Lock seat(s)
- `GET /locks/:lockId` - Check lock status
- `DELETE /locks/:lockId` - Release lock

#### 4. Payment Service (`apps/payment-service`)

**Mock implementation in Phase 2**

**Features:**

- Simulate payment success/failure
- Publish events to RabbitMQ: `PaymentSucceeded`, `PaymentFailed`

**Endpoints:**

- `POST /payments` - Process payment
- `GET /payments/:id` - Payment status

#### 5. Booking Service (`apps/booking-service`)

**Central orchestrator**

**Features:**

- Validate seat locks
- Call payment service
- Create booking on success
- Publish `BookingCreated` event

**Endpoints:**

- `POST /bookings` - Create booking
- `GET /bookings/:id` - Booking details
- `GET /bookings` - User's bookings

#### 6. Ticket Service (`apps/ticket-service`)

**Event-driven**

**Features:**

- Subscribe to `BookingCreated` events
- Generate QR code (Node package: `qrcode`)
- Generate PDF ticket (Node package: `pdfkit`)
- Publish `TicketIssued` event

**Endpoints:**

- `GET /tickets/:id` - Ticket details
- `GET /tickets/:id/pdf` - Download PDF

#### 7. Notification Service (`apps/notification-service`)

**Event-driven, no HTTP endpoints**

**Features:**

- Subscribe to `TicketIssued` events
- Send email with ticket link (Phase 2: log only)

#### 8. API Gateway (`apps/api-gateway`)

**Single public entry point**

**Features:**

- Route all external requests
- JWT validation on protected routes
- Request logging, rate limiting

**Routes:**

- `/api/auth/**` → Auth Service
- `/api/users/**` → Auth Service
- `/api/trains/**` → Schedule Service
- `/api/seats/**` → Seat Service
- `/api/bookings/**` → Booking Service
- `/api/tickets/**` → Ticket Service
- `/api/payments/**` → Payment Service

## Key Design Decisions

### 1. NID as Primary Identifier

- **Requirement:** NID is required for registration (10 or 13 digits)
- **Reason:** Bangladesh Railway policy, matches real-world ticketing
- Email and phone also required and unique

### 2. Refresh Token Storage

- **Phase 2:** Postgres (via Prisma)
- **Future:** Migrate to Redis for better performance and TTL

### 3. RabbitMQ Usage

- **Rule:** Only for inter-service communication (backend-to-backend)
- **NOT for:** Sending files (PDFs), direct client communication
- **Events:** Small JSON payloads with IDs and metadata

### 4. Ticket PDF Delivery

- PDF generated in Ticket Service
- **NOT** sent via RabbitMQ
- Delivered via HTTP: `GET /tickets/:id/pdf`
- Notification service sends email with link to PDF

### 5. Seat Locking Strategy

- Redis `SET key NX EX ttl` for atomic operations
- Key format: `seat_lock:{journeyId}:{coach}:{seatNo}`
- TTL: 10 minutes (configurable)

### 6. API Documentation

- **Tool:** Swagger/OpenAPI
- **Access:** Each service exposes `/api/docs`
- **Auth:** Use Bearer token in Swagger UI for protected endpoints

## Development Guidelines

### File Organization

- No README.md in individual services (only at root if needed)
- Use descriptive file names
- Follow NestJS conventions (module, controller, service, dto)

### Swagger Documentation

- Add `@ApiProperty()` to all DTOs
- Add `@ApiTags()` to controllers
- Add `@ApiBearerAuth('JWT-auth')` to protected endpoints
- Add response examples with `@ApiResponse()`

### Error Handling

- Use NestJS built-in exceptions
- Return meaningful error messages
- Validate all inputs with class-validator

### Commit Strategy

- Commit after each meaningful milestone
- Use conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code improvements

## Environment Variables

Each service needs:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/jatra_db
REDIS_URL=redis://:pass@localhost:6379
RABBITMQ_URL=amqp://user:pass@localhost:5672/jatra
JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=300X
```

## Next Steps for AI Assistants

When continuing this project:

1. **Check Phase 2 Status:** Review "Phase 2: Backend Implementation Status" above
2. **Current Task:** Implement Schedule/Search Service (marked 🚧)
3. **Follow Service Creation Order:**
   - Schedule/Search → Seat/Reservation → Payment → Booking → Ticket → Notification → API Gateway
4. **For Each Service:**
   - Create NestJS app in `apps/{service-name}/`
   - Add Prisma models to `libs/database/prisma/schema.prisma`
   - Implement DTOs with Swagger decorators
   - Add validation with class-validator
   - Configure Swagger in main.ts
   - Write basic tests
   - Commit and push after service is complete
5. **Import Errors:** Check that shared libraries (`@jatra/*`) are properly referenced
6. **No Markdown Docs:** Skip README files unless explicitly requested

## Common Issues & Fixes

### Import Errors

- Ensure `libs/` folders have proper `index.ts` exports
- Check `tsconfig.base.json` paths are correct
- Install dependencies: `npm install` or `pnpm install`

### Prisma Issues

- Run migrations: `npx prisma migrate dev`
- Generate client: `npx prisma generate`
- Database URL must be set in `.env`

### Swagger Not Working

- Install: `npm i @nestjs/swagger`
- Import in DTOs: `import { ApiProperty } from '@nestjs/swagger';`
- Configure in main.ts with DocumentBuilder

## Contact & Repository

- **Repository:** https://github.com/BayajidAlam/jatra
- **Branch:** main
- **Owner:** BayajidAlam

---

**For AI Assistants:** This file should be your single source of truth. Always refer to it before making changes. Update this file when you complete a service or make significant architectural decisions.
