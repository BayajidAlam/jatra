# Jatra Railway Ticketing System - AI Context File

## Project Overview

**Project Name**: Jatra - Bangladesh Railway E-Ticketing System  
**Type**: BSc Final Year Project + BUET Hackathon Submission  
**Tech Stack**: NestJS, Prisma, PostgreSQL, Redis, RabbitMQ, Docker, Kubernetes  
**Architecture**: Microservices with Event-Driven Communication

## Problem Statement

Current Bangladesh Railway ticketing system (Shohoz) suffers from:

- System crashes during peak times (Eid, holidays)
- Unfair seat allocation (same seat sold to multiple users)
- No observability or monitoring
- Poor user experience

## Solution: Jatra Platform

A scalable, microservices-based ticketing platform with:

1. **Redis-based seat locking** to prevent double booking
2. **Event-driven architecture** for decoupled services
3. **Horizontal scaling** via Kubernetes
4. **Full observability** with Prometheus, Grafana, Jaeger
5. **CI/CD pipeline** for automated deployments

---

## Phase 2: Backend Implementation (CURRENT PHASE)

### Completed Services

#### ✅ 1. Auth & User Service

**Location**: `/apps/auth-service`  
**Port**: 3001  
**Database**: Postgres (User, RefreshToken tables)

**Key Features**:

- NID-based registration (10 or 13 digits, primary identifier)
- Phone (Bangladesh format: +880 or 01...) - required
- Email - required
- JWT authentication (access + refresh tokens)
- Refresh tokens stored in Postgres (will migrate to Redis later)
- Login via NID, email, or phone

**Endpoints**:

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile

**Swagger Documentation**: http://localhost:3001/api (when running)

---

### Pending Services (TO BE IMPLEMENTED)

#### 🔲 2. Schedule/Search Service

**Location**: `/apps/schedule-service` (not created yet)  
**Port**: 3002  
**Database**: Postgres (Stations, Trains, Routes, Journeys)

**Required Data Models**:

```prisma
model Station {
  id        String   @id @default(uuid())
  code      String   @unique // DHK, CTG, etc.
  name      String   // Dhaka, Chattogram
  city      String
  createdAt DateTime @default(now())
}

model Train {
  id          String   @id @default(uuid())
  trainNo     String   @unique // 707, 708
  name        String   // Suborno Express
  trainType   TrainType // INTERCITY, MAIL, LOCAL
  totalSeats  Int
  createdAt   DateTime @default(now())
}

model Route {
  id          String   @id @default(uuid())
  trainId     String
  train       Train    @relation(fields: [trainId], references: [id])
  fromStation String
  toStation   String
  duration    Int      // minutes
  distance    Int      // km
  fare        Decimal
}

model Journey {
  id            String   @id @default(uuid())
  trainId       String
  date          DateTime
  departureTime DateTime
  arrivalTime   DateTime
  availableSeats Int
  status        JourneyStatus // SCHEDULED, RUNNING, COMPLETED, CANCELLED
}

enum TrainType {
  INTERCITY
  MAIL
  LOCAL
  EXPRESS
}

enum JourneyStatus {
  SCHEDULED
  RUNNING
  COMPLETED
  CANCELLED
}
```

**Required Endpoints**:

- `GET /trains?from=&to=&date=` - Search trains
- `GET /trains/:id` - Train details
- `GET /trains/:id/journeys?date=` - Journeys for a train
- `GET /journeys/:id` - Journey details
- `POST /admin/trains` - Create train (admin only)
- `POST /admin/routes` - Create route (admin only)

#### 🔲 3. Seat/Reservation Service

**Location**: `/apps/seat-service` (not created yet)  
**Port**: 3003  
**Database**: Postgres + **Redis** (for locks)

**Core Innovation**: Redis-based seat locking using `SET key NX EX`

**Redis Key Strategy**:

```
seat_lock:{journeyId}:{coach}:{seatNo} -> {userId, expiresAt}
TTL: 5 minutes (configurable)
```

**Required Endpoints**:

- `POST /locks` - Lock seats (returns lockId)
- `GET /locks/:id` - Check lock status
- `DELETE /locks/:id` - Release lock

**Lock Logic**:

1. Client requests to lock seat(s)
2. For each seat: `SET seat_lock:J123:C1:12A userId NX EX 300`
3. If any seat already locked → rollback all and return error
4. Return lockId to client
5. Client must complete booking within TTL, else lock expires

#### 🔲 4. Payment Service (Mock)

**Location**: `/apps/payment-service` (not created yet)  
**Port**: 3004  
**Database**: Postgres (Payments table)  
**Message Queue**: RabbitMQ (publish payment events)

**Required Endpoints**:

- `POST /payments` - Initiate mock payment
- `GET /payments/:id` - Payment status

**Events to Publish**:

- `payment.succeeded` → { userId, amount, bookingRequestId, transactionId }
- `payment.failed` → { userId, reason }

#### 🔲 5. Booking Service

**Location**: `/apps/booking-service` (not created yet)  
**Port**: 3005  
**Database**: Postgres (Bookings table)  
**Message Queue**: RabbitMQ (publish/consume events)

**Booking Flow** (synchronous + async):

1. Receive `POST /bookings` with journeyId, seats, lockId
2. Validate JWT user
3. **Validate seat lock** with Seat Service (HTTP)
4. **Call Payment Service** (HTTP)
5. If payment success:
   - Write booking to Postgres
   - **Publish `booking.created` event** (RabbitMQ)
   - Return booking details to client

**Required Endpoints**:

- `POST /bookings` - Create booking
- `GET /bookings/:id` - Booking details
- `GET /bookings` - List user bookings
- `PATCH /bookings/:id/cancel` - Cancel booking

**Events**:

- Publish: `booking.created`, `booking.cancelled`
- Consume: `payment.succeeded`, `payment.failed`

#### 🔲 6. Ticket Service

**Location**: `/apps/ticket-service` (not created yet)  
**Port**: 3006  
**Database**: Postgres (Tickets table)  
**Message Queue**: RabbitMQ (consume booking events)

**Key Features**:

- Generate QR code (encode ticket verification URL)
- Generate PDF ticket (using `pdfkit` or `pdfmake`)
- Provide downloadable PDF endpoint

**Required Data Model**:

```prisma
model Ticket {
  id            String   @id @default(uuid())
  pnr           String   @unique // Booking code
  bookingId     String   @unique
  userId        String
  journeyId     String
  coach         String
  seatNumber    String
  qrData        String   // QR payload
  status        TicketStatus
  issuedAt      DateTime @default(now())
}

enum TicketStatus {
  ISSUED
  CANCELLED
  USED
}
```

**Required Endpoints**:

- `GET /tickets/:id` - Ticket details (JSON)
- `GET /tickets/:id/pdf` - Download PDF
- `GET /tickets?bookingId=` - Tickets for a booking

**Event Flow**:

1. Consume `booking.created` from RabbitMQ
2. Create ticket record
3. Generate QR code
4. Generate PDF (on-demand or pre-generate)
5. Publish `ticket.issued` event

#### 🔲 7. Notification Service

**Location**: `/apps/notification-service` (not created yet)  
**Port**: 3007  
**Database**: None (stateless) or Postgres (notification log)  
**Message Queue**: RabbitMQ (consume ticket events)

**Event Flow**:

1. Consume `ticket.issued` from RabbitMQ
2. Send email with ticket download link
3. Send SMS with PNR (Phase 2: just log; later: real SMS integration)

**No HTTP endpoints** (purely event-driven consumer)

**For Phase 2**:

- Just log "Email/SMS sent" to console
- Later phases: integrate SendGrid, Twilio, etc.

#### 🔲 8. API Gateway

**Location**: `/apps/api-gateway` (not created yet)  
**Port**: 3000  
**Responsibilities**:

- Single public entry point
- Route requests to services
- JWT validation on protected routes
- Rate limiting (optional)
- Request logging

**Route Mapping**:

```
/api/auth/**       → auth-service:3001
/api/users/**      → auth-service:3001
/api/trains/**     → schedule-service:3002
/api/journeys/**   → schedule-service:3002
/api/seats/**      → seat-service:3003
/api/locks/**      → seat-service:3003
/api/bookings/**   → booking-service:3005
/api/payments/**   → payment-service:3004
/api/tickets/**    → ticket-service:3006
```

---

## Technology Decisions

### Why NestJS?

- TypeScript-first, excellent for microservices
- Built-in decorators for validation, Swagger, DI
- Native support for microservices patterns

### Why Prisma?

- Type-safe database client
- Clean schema syntax
- Excellent migrations
- Auto-generated types

### Why Redis for Seat Locking?

- Atomic `SET NX EX` operations
- Sub-millisecond performance
- Built-in TTL for automatic lock expiry
- Simple key-value model perfect for locks

### Why RabbitMQ?

- Proven message broker
- Easy to set up locally (Docker)
- Good for event-driven patterns
- Alternatives: Kafka (more complex), NATS (simpler)

### Why Postgres?

- ACID transactions critical for bookings
- Mature, reliable
- Good for structured railway data

---

## Development Workflow

### Service Creation Order (as per Phase 2 plan):

1. ✅ Auth & User Service (DONE)
2. 🔲 Schedule/Search Service (NEXT)
3. 🔲 Seat/Reservation Service
4. 🔲 Payment Service (mock)
5. 🔲 Booking Service
6. 🔲 Ticket Service
7. 🔲 Notification Service
8. 🔲 API Gateway

### For Each Service:

1. Create folder: `apps/{service-name}`
2. Add `package.json`, `tsconfig.json`, `nest-cli.json`
3. Define Prisma models (if needed)
4. Implement controllers, services, DTOs
5. Add Swagger decorators
6. Write basic tests
7. Update `docker-compose.yml` (add service container)
8. **Commit and push to GitHub** after meaningful milestone

### Git Commit Convention:

```
feat: implement {Service Name}
- Feature 1
- Feature 2
- Complete Phase 2 Step X
```

---

## Environment Variables

### Auth Service (`.env`):

```env
DATABASE_URL=postgresql://jatra_user:jatra_password@localhost:5432/jatra_db
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3001
```

### Future Services Will Need:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `RABBITMQ_URL`
- Service-specific ports

---

## Docker Compose Setup

**File**: `/docker-compose.yml`

**Current Services**:

- Postgres (port 5432)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672 for UI)
- PgAdmin (port 5050) - optional
- Redis Commander (port 8081) - optional

**To Add**: Each backend service as it's implemented

---

## API Documentation

All services use **Swagger/OpenAPI**.

**Access Swagger UI**:

- Auth Service: http://localhost:3001/api
- Schedule Service: http://localhost:3002/api (when ready)
- etc.

**Swagger Setup** (for each service):

1. Install: `@nestjs/swagger`
2. Configure in `main.ts`:

```typescript
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const config = new DocumentBuilder().setTitle("Service Name API").setDescription("Description").setVersion("1.0").addBearerAuth().build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api", app, document);
```

3. Add decorators to DTOs (`@ApiProperty`) and controllers (`@ApiTags`, `@ApiOperation`)

---

## Key Design Patterns

### 1. Database-per-Service

Each service owns its database tables. No direct cross-service DB access.

### 2. API Composition

When service A needs data from service B, it calls B's HTTP API (for now).  
Later: Consider CQRS or read replicas for complex queries.

### 3. Event-Driven for Async Flows

- Critical path (lock, book, pay): **synchronous HTTP**
- Downstream updates (ticket, notification): **asynchronous events** via RabbitMQ

### 4. Saga Pattern (for Booking)

Booking service orchestrates distributed transaction:

1. Lock seats (Seat Service)
2. Charge payment (Payment Service)
3. If any fails → compensate (release lock, refund)

---

## Testing Strategy

### Phase 2 (MVP):

- Unit tests for core business logic (seat locking, booking flow)
- E2E test for full booking flow (auth → search → lock → book → ticket)

### Later Phases:

- Load tests (simulate 10k concurrent users)
- Integration tests per service
- Contract tests between services

---

## Deployment (Phase 4)

### Local Development:

```bash
docker-compose up -d  # Start Postgres, Redis, RabbitMQ
pnpm install
npx prisma generate
npx prisma migrate dev
cd apps/auth-service && npm run start:dev
```

### Production (Kubernetes):

- Each service: Deployment + Service + HPA
- Ingress for API Gateway
- Secrets for DB, Redis, JWT
- ConfigMaps for env vars

---

## Common Issues & Solutions

### Issue: `@prisma/client` not found

**Solution**: Run `npx prisma generate` from project root

### Issue: Swagger decorators not working

**Solution**: Ensure `@nestjs/swagger` installed: `pnpm add @nestjs/swagger`

### Issue: Import errors for shared libs

**Solution**: Check `tsconfig.base.json` paths are correctly mapped

### Issue: Redis connection failed

**Solution**: Ensure Docker Compose is running: `docker-compose up -d redis`

---

## Next Steps for AI Assistant

When continuing this project:

1. **Check the todo list** (current phase and status)
2. **Read this file** for context on what's done and what's next
3. **Follow the service creation order** (don't skip ahead)
4. **Use existing patterns** from auth-service as template
5. **Add Swagger docs** to every new endpoint
6. **Commit meaningful milestones** to GitHub
7. **Don't over-engineer** - keep Phase 2 simple and functional

---

## Project File Structure

```
jatra-railway/
├── apps/
│   ├── auth-service/          ✅ DONE
│   ├── schedule-service/      🔲 TODO
│   ├── seat-service/          🔲 TODO
│   ├── booking-service/       🔲 TODO
│   ├── payment-service/       🔲 TODO
│   ├── ticket-service/        🔲 TODO
│   ├── notification-service/  🔲 TODO
│   └── api-gateway/           🔲 TODO
├── libs/
│   ├── common/
│   ├── database/
│   │   └── prisma/
│   │       ├── schema.prisma  ✅ User + RefreshToken done
│   │       └── prisma.config.ts
│   ├── messaging/
│   ├── qr-code/
│   └── sms/
├── docs/
│   ├── PROPOSAL_DEFENSE_SLIDES.md
│   ├── ARCHITECTURE_VISUAL.md
│   └── PROJECT_PHASES_OVERVIEW.md
├── docker-compose.yml
├── package.json
└── AI_CONTEXT.md                ✅ THIS FILE
```

---

## Contact & Resources

**GitHub Repo**: https://github.com/BayajidAlam/jatra  
**Developer**: Bayajid Alam (bayajidswe@...)  
**Institution**: BUET (Bangladesh University of Engineering and Technology)

---

**Last Updated**: November 19, 2025  
**Current Phase**: Phase 2 - Backend Implementation  
**Next Milestone**: Schedule/Search Service
