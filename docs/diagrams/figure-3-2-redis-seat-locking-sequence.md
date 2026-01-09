# Figure 3.2 — Redis Seat Locking Sequence Diagram

Description

- Sequence diagram describing how seat reservation uses Redis locks to provide short-term holds while a user completes booking.

Mermaid diagram

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

Notes

- `SETNX` (or Redlock variant) is used to acquire locks; reservation service ensures locks are cleared on booking creation or expiry.
