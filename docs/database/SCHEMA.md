# Database Schema Documentation

## Overview

Jatra uses **database-per-service** pattern for data isolation and independent scaling. Each microservice has its own PostgreSQL database.

## Database List

| Database | Service | Purpose |
|----------|---------|---------|
| `auth_db` | Auth Service | User authentication, JWT tokens, OTPs |
| `user_db` | User Service | User profiles, passenger details |
| `schedule_db` | Schedule Service | Train schedules, routes, stations, coaches, seats |
| `seat_reservation_db` | Seat Reservation Service | Seat reservation audit logs |
| `booking_db` | Booking Service | Bookings, booking passengers |
| `payment_db` | Payment Service | Payment transactions, SSLCommerz records |
| `ticket_db` | Ticket Service | Generated tickets, QR codes, validations |
| `notification_db` | Notification Service | Notification logs, SMS/email delivery status |
| `reporting_db` | Reporting Service | Analytics, aggregated reports |

## Schema Design Principles

1. **Database per Service**: Each microservice owns its database
2. **No Cross-Database Joins**: Services communicate via APIs or events
3. **Denormalization**: Duplicate data where needed for performance
4. **Audit Trails**: Track creation/update timestamps and user IDs
5. **Soft Deletes**: Use `deleted_at` instead of hard deletes

---

## 1. Auth Service Database (`auth_db`)

### Tables

#### `users`
Primary user authentication table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'USER', -- USER, ADMIN, SUPER_ADMIN
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, BANNED
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

#### `otp_records`
OTP verification records (SMS/Email).

```sql
CREATE TABLE otp_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone VARCHAR(20),
  email VARCHAR(255),
  otp_code VARCHAR(6) NOT NULL,
  otp_type VARCHAR(50) NOT NULL, -- LOGIN, REGISTRATION, BOOKING, PASSWORD_RESET
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_records(phone);
CREATE INDEX idx_otp_email ON otp_records(email);
CREATE INDEX idx_otp_expires_at ON otp_records(expires_at);
```

#### `refresh_tokens`
JWT refresh tokens for session management.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

---

## 2. User Service Database (`user_db`)

### Tables

#### `user_profiles`
Extended user profile information.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL, -- References auth_db.users.id (no FK across DBs)
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20), -- MALE, FEMALE, OTHER
  nid_number VARCHAR(50),
  passport_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Bangladesh',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### `passengers`
Saved passenger details for quick booking.

```sql
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth_db.users.id
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  nid_number VARCHAR(50),
  passport_number VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_passengers_user_id ON passengers(user_id);
```

---

## 3. Schedule Service Database (`schedule_db`)

### Tables

#### `stations`
Railway stations.

```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., DHK, CTG
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stations_code ON stations(code);
CREATE INDEX idx_stations_city ON stations(city);
```

#### `trains`
Train master data.

```sql
CREATE TABLE trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  train_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- INTERCITY, MAIL, EXPRESS, LOCAL
  total_coaches INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trains_train_number ON trains(train_number);
CREATE INDEX idx_trains_type ON trains(type);
```

#### `routes`
Train routes with origin and destination.

```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID REFERENCES trains(id) ON DELETE CASCADE,
  origin_station_id UUID REFERENCES stations(id),
  destination_station_id UUID REFERENCES stations(id),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  journey_duration_minutes INTEGER NOT NULL,
  operates_on VARCHAR(50) DEFAULT 'ALL', -- ALL, WEEKDAYS, WEEKENDS
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_train_id ON routes(train_id);
CREATE INDEX idx_routes_origin ON routes(origin_station_id);
CREATE INDEX idx_routes_destination ON routes(destination_station_id);
```

#### `route_stops`
Intermediate stops in a route.

```sql
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  stop_order INTEGER NOT NULL,
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  platform_number VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_station_id ON route_stops(station_id);
```

#### `coaches`
Coach configurations for trains.

```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID REFERENCES trains(id) ON DELETE CASCADE,
  coach_number VARCHAR(10) NOT NULL,
  coach_type VARCHAR(50) NOT NULL, -- AC_CHAIR, SNIGDHA, SHOVAN, AC_BERTH, SLEEPER
  total_seats INTEGER NOT NULL,
  base_fare DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(train_id, coach_number)
);

CREATE INDEX idx_coaches_train_id ON coaches(train_id);
CREATE INDEX idx_coaches_coach_type ON coaches(coach_type);
```

#### `seats`
Seat configurations in coaches.

```sql
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  seat_type VARCHAR(50) DEFAULT 'STANDARD', -- STANDARD, WINDOW, AISLE
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coach_id, seat_number)
);

CREATE INDEX idx_seats_coach_id ON seats(coach_id);
CREATE INDEX idx_seats_seat_number ON seats(seat_number);
```

#### `schedules`
Daily train schedules (generated from routes).

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID REFERENCES trains(id),
  route_id UUID REFERENCES routes(id),
  journey_date DATE NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, DELAYED, CANCELLED, COMPLETED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(train_id, journey_date)
);

CREATE INDEX idx_schedules_journey_date ON schedules(journey_date);
CREATE INDEX idx_schedules_train_id ON schedules(train_id);
CREATE INDEX idx_schedules_route_id ON schedules(route_id);
```

---

## 4. Seat Reservation Service Database (`seat_reservation_db`)

### Tables

#### `seat_reservations`
Audit log of seat reservations (Redis handles actual locks).

```sql
CREATE TABLE seat_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  seat_id UUID NOT NULL,
  journey_date DATE NOT NULL,
  user_id UUID NOT NULL,
  booking_id UUID, -- NULL until booking confirmed
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'LOCKED', -- LOCKED, CONFIRMED, RELEASED, EXPIRED
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_train_journey ON seat_reservations(train_id, journey_date);
CREATE INDEX idx_reservations_user_id ON seat_reservations(user_id);
CREATE INDEX idx_reservations_booking_id ON seat_reservations(booking_id);
CREATE INDEX idx_reservations_status ON seat_reservations(status);
```

---

## 5. Booking Service Database (`booking_db`)

### Tables

#### `bookings`
Main booking records.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pnr VARCHAR(10) UNIQUE NOT NULL,
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  train_id UUID NOT NULL,
  route_id UUID NOT NULL,
  journey_date DATE NOT NULL,
  from_station_id UUID NOT NULL,
  to_station_id UUID NOT NULL,
  total_passengers INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, FAILED
  payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_bookings_pnr ON bookings(pnr);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_journey_date ON bookings(journey_date);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
```

#### `booking_passengers`
Passenger details in each booking.

```sql
CREATE TABLE booking_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  seat_id UUID NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender VARCHAR(20) NOT NULL,
  fare DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_passengers_booking_id ON booking_passengers(booking_id);
```

---

## 6. Payment Service Database (`payment_db`)

### Tables

#### `payments`
Payment transaction records.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- SSLCOMMERZ, BKASH, NAGAD, CARD
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  status VARCHAR(50) DEFAULT 'INITIATED', -- INITIATED, PROCESSING, SUCCESS, FAILED, REFUNDED
  gateway_response JSONB,
  sslcommerz_session_id VARCHAR(255),
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 7. Ticket Service Database (`ticket_db`)

### Tables

#### `tickets`
Generated tickets with QR codes.

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  passenger_id UUID NOT NULL, -- References booking_passengers.id
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  pnr VARCHAR(10) NOT NULL,
  qr_code TEXT NOT NULL,
  qr_signature VARCHAR(255) NOT NULL,
  journey_date DATE NOT NULL,
  from_station VARCHAR(100) NOT NULL,
  to_station VARCHAR(100) NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  coach_number VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'VALID', -- VALID, USED, CANCELLED, EXPIRED
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_pnr ON tickets(pnr);
CREATE INDEX idx_tickets_journey_date ON tickets(journey_date);
```

---

## 8. Notification Service Database (`notification_db`)

### Tables

#### `notifications`
Notification delivery logs.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- SMS, EMAIL, PUSH
  channel VARCHAR(50), -- SMS_PROVIDER, EMAIL_PROVIDER
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, FAILED, DELIVERED
  provider_response JSONB,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 9. Reporting Service Database (`reporting_db`)

### Tables

#### `daily_stats`
Daily aggregated statistics.

```sql
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE UNIQUE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  successful_bookings INTEGER DEFAULT 0,
  failed_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_passengers INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date);
```

---

## Redis Key Patterns

Redis is used for caching and distributed locking, not persistent storage.

### Seat Locks
```
seat:{trainId}:{coachId}:{seatNumber}:{journeyDate}
Value: userId
TTL: 300 seconds (5 minutes)
```

### OTP Cache
```
otp:{phone}
Value: otpCode
TTL: 300 seconds (5 minutes)
```

### Search Cache
```
search:trains:{origin}:{destination}:{date}
Value: JSON array of trains
TTL: 3600 seconds (1 hour)
```

### User Session
```
session:{userId}:{sessionId}
Value: JWT refresh token
TTL: 604800 seconds (7 days)
```

---

## Migration Strategy

1. **Use TypeORM or Prisma** for migrations
2. **Version Control**: All migrations in `infra/migrations/`
3. **Rollback Support**: Each migration has up/down scripts
4. **Seed Data**: Sample stations, trains for development
5. **CI/CD Integration**: Auto-run migrations on deployment

---

## Backup & Recovery

1. **Daily Automated Backups** of PostgreSQL
2. **Point-in-Time Recovery** enabled
3. **Redis Persistence**: RDB snapshots every 5 minutes
4. **Retention**: 30 days for production

---

## Performance Optimization

1. **Indexes**: Created on foreign keys and frequently queried columns
2. **Partitioning**: Consider partitioning `schedules` by date (future)
3. **Read Replicas**: For search and reporting services
4. **Connection Pooling**: Max 20 connections per service
5. **Query Optimization**: Use EXPLAIN ANALYZE in development

---

**Last Updated**: November 16, 2025
