# Entity Relationship Diagram (ERD)

## Overview

This document describes the entity relationships across all microservices in the Jatra Railway Ticketing System.

## ERD Diagram (Mermaid)

```mermaid
erDiagram
    %% Auth Service
    users ||--o{ otp_records : "generates"
    users ||--o{ refresh_tokens : "has"
    
    %% User Service
    users ||--|| user_profiles : "has"
    users ||--o{ passengers : "saves"
    
    %% Schedule Service
    stations ||--o{ routes : "origin"
    stations ||--o{ routes : "destination"
    stations ||--o{ route_stops : "stops_at"
    trains ||--o{ routes : "operates"
    trains ||--o{ coaches : "has"
    trains ||--o{ schedules : "scheduled"
    routes ||--o{ route_stops : "includes"
    routes ||--o{ schedules : "generates"
    coaches ||--o{ seats : "contains"
    
    %% Booking Service
    users ||--o{ bookings : "creates"
    trains ||--o{ bookings : "booked_on"
    bookings ||--o{ booking_passengers : "includes"
    coaches ||--o{ booking_passengers : "assigned"
    seats ||--o{ booking_passengers : "assigned"
    
    %% Payment Service
    users ||--o{ payments : "makes"
    bookings ||--|| payments : "paid_by"
    
    %% Ticket Service
    bookings ||--o{ tickets : "generates"
    booking_passengers ||--|| tickets : "issued_to"
    
    %% Seat Reservation Service
    users ||--o{ seat_reservations : "reserves"
    trains ||--o{ seat_reservations : "reserved_on"
    coaches ||--o{ seat_reservations : "in_coach"
    seats ||--o{ seat_reservations : "locked"
    bookings ||--o{ seat_reservations : "confirmed_by"
    
    %% Notification Service
    users ||--o{ notifications : "receives"
    
    %% Reporting Service
    daily_stats ||--o{ bookings : "aggregates"

    %% Table Definitions
    
    users {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        boolean is_email_verified
        boolean is_phone_verified
        string role
        string status
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    otp_records {
        uuid id PK
        uuid user_id FK
        string phone
        string email
        string otp_code
        string otp_type
        boolean is_verified
        timestamp expires_at
        timestamp verified_at
        timestamp created_at
    }
    
    refresh_tokens {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        timestamp created_at
        timestamp revoked_at
    }
    
    user_profiles {
        uuid id PK
        uuid user_id UK
        string full_name
        date date_of_birth
        string gender
        string nid_number
        string passport_number
        text address
        string city
        string postal_code
        string country
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }
    
    passengers {
        uuid id PK
        uuid user_id FK
        string full_name
        date date_of_birth
        string gender
        string nid_number
        string passport_number
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }
    
    stations {
        uuid id PK
        string name
        string code UK
        string city
        decimal latitude
        decimal longitude
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    trains {
        uuid id PK
        string name
        string train_number UK
        string type
        integer total_coaches
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    routes {
        uuid id PK
        uuid train_id FK
        uuid origin_station_id FK
        uuid destination_station_id FK
        time departure_time
        time arrival_time
        integer journey_duration_minutes
        string operates_on
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    route_stops {
        uuid id PK
        uuid route_id FK
        uuid station_id FK
        integer stop_order
        time arrival_time
        time departure_time
        string platform_number
        timestamp created_at
    }
    
    coaches {
        uuid id PK
        uuid train_id FK
        string coach_number
        string coach_type
        integer total_seats
        decimal base_fare
        timestamp created_at
        timestamp updated_at
    }
    
    seats {
        uuid id PK
        uuid coach_id FK
        string seat_number
        string seat_type
        boolean is_available
        timestamp created_at
    }
    
    schedules {
        uuid id PK
        uuid train_id FK
        uuid route_id FK
        date journey_date
        timestamp departure_time
        timestamp arrival_time
        integer available_seats
        integer total_seats
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    bookings {
        uuid id PK
        uuid user_id FK
        string pnr UK
        string booking_reference UK
        uuid train_id FK
        uuid route_id FK
        date journey_date
        uuid from_station_id FK
        uuid to_station_id FK
        integer total_passengers
        decimal total_amount
        string booking_status
        string payment_status
        timestamp created_at
        timestamp updated_at
        timestamp cancelled_at
    }
    
    booking_passengers {
        uuid id PK
        uuid booking_id FK
        uuid coach_id FK
        uuid seat_id FK
        string seat_number
        string passenger_name
        integer passenger_age
        string passenger_gender
        decimal fare
        timestamp created_at
    }
    
    seat_reservations {
        uuid id PK
        uuid train_id FK
        uuid coach_id FK
        uuid seat_id FK
        date journey_date
        uuid user_id FK
        uuid booking_id FK
        timestamp reserved_at
        timestamp released_at
        string status
        timestamp expires_at
        timestamp created_at
    }
    
    payments {
        uuid id PK
        uuid booking_id FK
        uuid user_id FK
        string transaction_id UK
        string payment_method
        decimal amount
        string currency
        string status
        jsonb gateway_response
        string sslcommerz_session_id
        timestamp initiated_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    tickets {
        uuid id PK
        uuid booking_id FK
        uuid passenger_id FK
        string ticket_number UK
        string pnr
        text qr_code
        string qr_signature
        date journey_date
        string from_station
        string to_station
        string seat_number
        string coach_number
        string status
        timestamp issued_at
        timestamp validated_at
        timestamp created_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        string type
        string channel
        string recipient
        string subject
        text message
        string status
        jsonb provider_response
        timestamp sent_at
        timestamp delivered_at
        timestamp created_at
    }
    
    daily_stats {
        uuid id PK
        date stat_date UK
        integer total_bookings
        integer successful_bookings
        integer failed_bookings
        decimal total_revenue
        integer total_passengers
        integer unique_users
        timestamp created_at
        timestamp updated_at
    }
```

## Cross-Service Data Flow

### Booking Flow

```
1. User Login (Auth Service)
   users → otp_records → refresh_tokens

2. Search Trains (Schedule Service)
   stations → routes → trains → schedules → coaches → seats

3. Reserve Seat (Seat Reservation Service)
   users → seat_reservations (+ Redis lock)

4. Create Booking (Booking Service)
   users → bookings → booking_passengers

5. Payment (Payment Service)
   users → payments → booking (update status)

6. Generate Ticket (Ticket Service)
   bookings → booking_passengers → tickets (with QR)

7. Send Notifications (Notification Service)
   users → notifications (SMS/Email)

8. Analytics (Reporting Service)
   bookings → daily_stats (aggregation)
```

## Key Relationships

### 1. User-Centric Relationships
- **users** (auth_db) → Referenced by all services via `user_id`
- No foreign keys across databases (microservices pattern)
- Services fetch user data via User Service API

### 2. Train & Schedule Relationships
- **trains** → **coaches** → **seats** (1:N:N)
- **routes** → **route_stops** (1:N with stop order)
- **trains** + **routes** → **schedules** (generated daily)

### 3. Booking Flow Relationships
- **bookings** → **booking_passengers** (1:N)
- **bookings** ↔ **payments** (1:1)
- **booking_passengers** ↔ **tickets** (1:1)

### 4. Seat Locking Flow
- **Redis Lock** (temporary) → **seat_reservations** (audit log) → **bookings** (confirmed)

## Data Consistency Patterns

### 1. Eventual Consistency
- Bookings trigger events → Notifications sent asynchronously
- Analytics updated via event listeners

### 2. Compensating Transactions (Saga Pattern)
- If payment fails → Release seat locks
- If booking cancelled → Refund payment → Cancel tickets

### 3. Idempotency
- All API operations use unique request IDs
- Duplicate payment attempts return same result

## Indexing Strategy

### High-Performance Queries

```sql
-- Most frequent queries:

-- 1. Search trains by route and date
CREATE INDEX idx_schedules_route_date ON schedules(route_id, journey_date);

-- 2. Find user bookings
CREATE INDEX idx_bookings_user_journey ON bookings(user_id, journey_date);

-- 3. Check seat availability
CREATE INDEX idx_reservations_train_date_status ON seat_reservations(train_id, journey_date, status);

-- 4. Payment lookup
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);

-- 5. Ticket validation
CREATE INDEX idx_tickets_pnr_journey ON tickets(pnr, journey_date, status);
```

## Database Size Estimates (1 Year, 1M Users)

| Database | Estimated Size | Notes |
|----------|---------------|-------|
| auth_db | ~500 MB | Users, OTPs, tokens |
| user_db | ~1 GB | Profiles, saved passengers |
| schedule_db | ~2 GB | Trains, routes, schedules (static + dynamic) |
| seat_reservation_db | ~5 GB | Audit logs (purge after 30 days) |
| booking_db | ~10 GB | Main transactional data |
| payment_db | ~3 GB | Payment records (keep forever) |
| ticket_db | ~8 GB | Tickets with QR codes |
| notification_db | ~4 GB | Notification logs (purge after 90 days) |
| reporting_db | ~500 MB | Aggregated stats |
| **Total** | **~34 GB** | Excludes indexes (~20% overhead) |

## Scaling Considerations

### Read Replicas
- **Schedule Service**: 2-3 read replicas (high read traffic)
- **Search Service**: Use schedule read replica
- **Reporting Service**: Dedicated replica with replication lag tolerance

### Partitioning (Future)
- `schedules` table: Partition by `journey_date` (monthly)
- `bookings` table: Partition by `created_at` (quarterly)
- `seat_reservations`: Partition by `journey_date` (monthly, purge old)

### Sharding (Future, if > 10M users)
- Shard `users` by `user_id` hash
- Shard `bookings` by `user_id` hash (co-locate with user data)

---

**Last Updated**: November 16, 2025
