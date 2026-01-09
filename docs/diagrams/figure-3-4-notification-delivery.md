# Figure 3.4 — Notification Delivery

Description

- Flow showing how booking/ticket events lead to email/SMS notifications via Notification Service and message broker.

Mermaid diagram

```mermaid
sequenceDiagram
  participant Booking as BookingService
  participant Rabbit as RabbitMQ
  participant Notification as NotificationService
  participant Email as EmailProvider
  participant SMS as SMSProvider

  Booking->>Rabbit: publish booking.created
  Rabbit-->>Notification: deliver booking.created
  Notification->>Email: format + send email
  Email-->>Notification: delivery status
  Notification->>SMS: format + send SMS
  SMS-->>Notification: delivery status
  Notification-->>Booking: ack (optional)
```

Notes

- Notification service subscribes to booking and payment topics and sends templated messages.
