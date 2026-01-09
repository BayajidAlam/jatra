# Figure 4.1 — Database Schema (ERD)

Description

- Entity-Relationship Diagram showing the core database tables and their relationships in the Jatra Railway system.

Mermaid diagram

```mermaid
erDiagram
  User ||--o{ Booking : creates
  User ||--o{ SavedPayment : has
  User {
    uuid id PK
    string email
    string passwordHash
    string phone
    string name
    timestamp createdAt
  }

  Train ||--o{ Journey : has
  Train {
    uuid id PK
    string trainNumber
    string name
    int totalSeats
    string type
  }

  Station ||--o{ JourneyStop : "stop at"
  Station {
    uuid id PK
    string code
    string name
    string city
  }

  Journey ||--o{ JourneyStop : includes
  Journey ||--o{ Booking : "booked for"
  Journey {
    uuid id PK
    uuid trainId FK
    date departureDate
    string status
    timestamp createdAt
  }

  JourneyStop {
    uuid id PK
    uuid journeyId FK
    uuid stationId FK
    int stopOrder
    time arrivalTime
    time departureTime
    decimal fare
  }

  Booking ||--o{ Ticket : generates
  Booking ||--|| Payment : has
  Booking {
    uuid id PK
    uuid userId FK
    uuid journeyId FK
    string status
    decimal totalAmount
    timestamp bookedAt
  }

  Ticket ||--|| Seat : assigns
  Ticket {
    uuid id PK
    uuid bookingId FK
    uuid seatId FK
    string passengerName
    int passengerAge
    string passengerGender
    string ticketNumber
    string status
    string qrCode
  }

  Seat {
    uuid id PK
    uuid trainId FK
    string seatNumber
    string coach
    string class
  }

  Payment {
    uuid id PK
    uuid bookingId FK
    decimal amount
    string method
    string status
    string transactionId
    timestamp paidAt
  }

  SavedPayment {
    uuid id PK
    uuid userId FK
    string method
    string last4
    timestamp createdAt
  }

  Reservation {
    uuid id PK
    uuid userId FK
    uuid journeyId FK
    string seatIds
    timestamp expiresAt
    string status
  }
```

Notes

- Primary keys are UUIDs for distributed system compatibility.
- Journey represents a specific train departure on a specific date.
- Reservation holds seats temporarily using Redis locks (not shown in persistent DB).
