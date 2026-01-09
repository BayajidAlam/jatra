# Figure 4.4 — Deployment Architecture

Description

- Container-based deployment architecture showing how services are deployed on Kubernetes.

Mermaid diagram

```mermaid
graph TB
  subgraph "User Access"
    Users[Users/Browsers]
  end

  subgraph "Load Balancer / Ingress"
    LB[Nginx Ingress Controller]
  end

  subgraph "Kubernetes Cluster"
    subgraph "Frontend Pod"
      Web[Next.js Web App<br/>:3000]
    end

    subgraph "API Gateway Pod"
      Gateway[API Gateway Go<br/>:3000]
    end

    subgraph "Backend Pods"
      Auth[Auth Service<br/>:3001]
      Schedule[Schedule Service<br/>:3002]
      SeatRes[Seat Reservation<br/>:3003]
      Booking[Booking Service<br/>:3004]
      Payment[Payment Service<br/>:3005]
      Ticket[Ticket Service<br/>:3006]
      Notif[Notification Service<br/>:3007]
      User[User Service<br/>:3008]
      Search[Search Service<br/>:3009]
      Admin[Admin Service<br/>:3010]
      Report[Reporting Service<br/>:3011]
    end

    subgraph "Message Broker"
      Rabbit[RabbitMQ<br/>:5672]
      RabbitMgmt[RabbitMQ Management<br/>:15672]
    end

    subgraph "Cache Layer"
      Redis[Redis<br/>:6379]
    end

    subgraph "Database"
      Postgres[(PostgreSQL<br/>:5432)]
    end

    subgraph "ConfigMaps & Secrets"
      Config[ConfigMap<br/>env vars]
      Secret[Secrets<br/>DB passwords, JWT keys]
    end
  end

  subgraph "External Services"
    PayGateway[Payment Gateway<br/>SSLCommerz/bKash]
    EmailSvc[Email Provider<br/>SendGrid/SES]
    SMSSvc[SMS Provider<br/>Twilio]
  end

  Users -->|HTTPS| LB
  LB --> Web
  Web --> Gateway
  Gateway --> Auth
  Gateway --> Schedule
  Gateway --> Search
  Gateway --> SeatRes
  Gateway --> Booking
  Gateway --> Payment
  Gateway --> Ticket
  Gateway --> User
  Gateway --> Admin
  Gateway --> Report

  Auth --> Postgres
  User --> Postgres
  Schedule --> Postgres
  Search --> Redis
  Search --> Postgres
  SeatRes --> Redis
  SeatRes --> Postgres
  Booking --> Postgres
  Booking --> Rabbit
  Payment --> Postgres
  Payment --> Rabbit
  Payment --> PayGateway
  Ticket --> Postgres
  Admin --> Postgres
  Report --> Postgres
  Notif --> Rabbit
  Notif --> EmailSvc
  Notif --> SMSSvc

  Gateway -.-> Config
  Gateway -.-> Secret
  Auth -.-> Config
  Auth -.-> Secret
  User -.-> Config
  Schedule -.-> Config
  Search -.-> Config
  SeatRes -.-> Config
  Booking -.-> Config
  Payment -.-> Config
  Ticket -.-> Config
  Admin -.-> Config
  Admin -.-> Secret
  Report -.-> Config
  Notif -.-> Config

  style Users fill:#e1f5ff
  style LB fill:#ffe1e1
  style Web fill:#fff4e1
  style Postgres fill:#e1ffe1
  style Redis fill:#ffe1f5
  style Rabbit fill:#f5e1ff
  style PayGateway fill:#f0f0f0
  style EmailSvc fill:#f0f0f0
  style SMSSvc fill:#f0f0f0
```

Notes

- Each service runs in a separate pod with horizontal scaling capability.
- Persistent volumes for PostgreSQL and RabbitMQ.
- Redis used for distributed locks (seat reservations).
- Helm charts manage deployment configuration.
