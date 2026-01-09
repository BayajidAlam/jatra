# Figure 3.3 — Payment Flow

Description

- Sequence diagram illustrating payment initiation, provider redirect/polling, and confirmation delivery to services.

Mermaid diagram

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant Web as Web Frontend
  participant Payment as PaymentService
  participant Gateway as PaymentGateway (External)
  participant Booking as BookingService
  participant Rabbit as RabbitMQ

  U->>Web: Click Pay
  Web->>Payment: POST /payments/initiate { bookingId, amount, method }
  Payment-->>Web: 200 { paymentId, redirectUrl }
  Web->>U: Redirect to Gateway (redirectUrl)
  U->>Gateway: Card details / 3DS
  Gateway-->>Payment: webhook / callback (payment success)
  Payment->>Booking: confirmPayment(paymentId)
  Payment->>Rabbit: publish payment.succeeded
  Booking-->>Web: 200 { ticket / booking }

  alt payment pending (e.g., U closed window)
    Payment->>Gateway: poll status
    Gateway-->>Payment: status
    Payment->>Booking: confirmPayment when succeeded
  end
```

Notes

- Payment service accepts provider webhooks and confirms bookings through internal events.
