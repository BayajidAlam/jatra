# Figure 3.1 — Microservices Architecture Diagram

Description

- High-level component diagram for the Jatra Railway system showing the web frontend, services, event bus, caches and databases.

Mermaid diagram

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
    
    subgraph "PostgreSQL Cluster (Logical Isolation)"
      AuthDB[(Auth DB)]
      BookingDB[(Booking DB)]
      TrainDB[(Train DB)]
      OtherDBs[(...)]
    end
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

Notes

- Each microservice owns its data (database per service). Services communicate via synchronous HTTP (through ingress) and asynchronous events via RabbitMQ. Redis is used by the seat reservation service for fast locks and short-lived reservations.
