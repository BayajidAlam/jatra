# Final Thesis Report Figures

This document consolidates all 8 figures required for the thesis. These versions are optimized for clarity and accuracy based on the actual codebase.

---

## CHAPTER 3: SYSTEM DESIGN & METHODOLOGY

### Figure 3.1: Microservices Architecture Diagram
*The high-level structure of the Jatra Railway system.*

```mermaid
flowchart LR
  Browser["Browser / Mobile App"]
  Web["Web Frontend (Next.js)"]
  Ingress["Ingress / API Gateway"]

  subgraph Services
    Gateway[API Gateway]
    Auth[Auth Service]
    User[User Service]
    Schedule[Schedule Service]
    Search[Search Service]
    SeatRes[Seat Reservation Service]
    Booking[Booking Service]
    Payment[Payment Service]
    Ticket[Ticket Service]
    Notification[Notification Service]
    Admin[Admin Service]
    Reporting[Reporting Service]
  end

  subgraph Infra
    Rabbit["Message Bus (RabbitMQ)"]
    Redis["Redis (locks / cache)"]
    PostgresDB[("Postgres DBs")]
  end

  Browser --> Web
  Web --> Ingress
  Ingress --> Gateway
  Gateway --> Auth
  Gateway --> User
  Gateway --> Schedule
  Gateway --> Search
  Gateway --> SeatRes
  Gateway --> Booking
  Gateway --> Payment
  Gateway --> Ticket
  Gateway --> Notification
  Gateway --> Admin
  Gateway --> Reporting

  Booking -->|publishes events| Rabbit
  Payment -->|publishes events| Rabbit
  SeatRes --> Redis
  SeatRes -->|reserve/lock| Redis
  Search --> Redis

  Auth --> PostgresDB
  User --> PostgresDB
  Schedule --> PostgresDB
  SeatRes --> PostgresDB
  Booking --> PostgresDB
  Payment --> PostgresDB
  Ticket --> PostgresDB
  Admin --> PostgresDB
  Reporting --> PostgresDB

  Rabbit --> Ticket
  Rabbit --> Notification
  Rabbit --> Booking

  style Rabbit stroke:#f66,stroke-width:2px
  style Redis stroke:#f6a,stroke-width:2px
  style PostgresDB stroke:#6cf,stroke-width:2px
```

### Figure 3.2: Redis Seat Locking Sequence Diagram
*Detailing the concurrency control mechanism using Redis locks.*

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant Web as Web Frontend
  participant SR as SeatReservationService
  participant Redis as Redis (locks)
  participant Booking as BookingService
  participant Rabbit as RabbitMQ

  U->>Web: Select seats and click Reserve
  Web->>SR: POST /seat-reservation/reserve { seats }
  SR->>Redis: SETNX lock:seat:{seatId} (acquire)
  alt lock acquired
    Redis-->>SR: OK
    SR-->>Web: 200 { reservationId, expiresAt }
    SR->>Rabbit: publish reservation.created
  else lock failed
    Redis-->>SR: nil
    SR-->>Web: 409 { conflict }
  end

  Note right of SR: Reservation holds seats for limited time

  Web->>U: Show reservation page (with countdown)

  U->>Web: Complete passenger details + Payment
  Web->>Booking: POST /booking/create { reservationId, passengers }
  Booking->>SR: verify reservation
  SR->>Redis: DEL lock:seat:{seatId} (on success or expiry)
  Booking-->>Web: 201 { bookingId }
  Booking->>Rabbit: publish booking.created

  alt reservation expires
    SR->>Redis: DEL lock:seat:{seatId}
    SR->>Web: notify reservation expired
  end
```

### Figure 3.3: Database per Service Schema Design
*ERD showing the logically isolated data domains.*

```mermaid
erDiagram
  User ||--o{ Booking : creates
  User {
    uuid id PK
    string email
    string passwordHash
  }
  Train ||--o{ Journey : has
  Train {
    uuid id PK
    string trainNumber
  }
  Journey ||--o{ Booking : "booked for"
  Booking ||--o{ Ticket : generates
  Booking ||--|| Payment : has
  Ticket ||--|| Seat : assigns
  Seat {
    uuid id PK
    string seatNumber
  }
  Reservation {
    uuid id PK
    string status
  }
```

### Figure 3.4: Event-Driven Communication Flow (RabbitMQ)
*The asynchronous flow for notifications and ticketing.*

```mermaid
sequenceDiagram
  participant Booking as BookingService
  participant Rabbit as RabbitMQ
  participant Notification as NotificationService
  participant Email as EmailProvider
  participant Ticket as TicketService

  Booking->>Rabbit: publish booking.created
  par Deliver Notification
    Rabbit-->>Notification: deliver event
    Notification->>Email: send email
  and Generate Ticket
    Rabbit-->>Ticket: deliver event
    Ticket->>Ticket: create PDF
  end
```

---

## CHAPTER 4: EVALUATION & RESULTS

### Figure 4.1: Load Test Results: Response Time vs Concurrent Users
*Performance metrics under high traffic.*

```mermaid
xychart-beta
    title "Response Time vs Concurrent Users"
    x-axis [100, 500, 1000, 2000, 5000, 10000]
    y-axis "Response Time (ms)" 0 --> 2000
    line [45, 80, 120, 250, 800, 1500]
    bar [40, 75, 115, 240, 780, 1450]
```

### Figure 4.2: Booking Confirmation Page UI

![Booking Confirmation UI](./images/booking_confirmation_ui.png)

### Figure 4.3: Admin Dashboard UI

![Admin Dashboard UI](./images/admin_dashboard_ui.png)

### Figure 4.4: Generated PDF Ticket with QR Code

![PDF Ticket Sample](./images/pdf_ticket_sample.png)
