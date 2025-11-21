# Notification Service

Email notification service with RabbitMQ consumer integration for the Jatra Railway booking system.

## Features

- 📧 **Email Notifications**: Send transactional emails using Nodemailer
- 🐰 **RabbitMQ Consumer**: Listen for booking events and trigger notifications
- 📝 **Email Templates**: Professional Handlebars templates for different notification types
- 🔄 **Retry Mechanism**: Automatic retry with configurable attempts and delays
- 📊 **Notification Tracking**: Store all notifications in database with status tracking
- 🎨 **REST API**: Query notification history and resend failed notifications

## Port

- **Service**: `3007`
- **Swagger**: http://localhost:3007/api/docs

## Prerequisites

### 1. RabbitMQ (Required)

RabbitMQ is required for the service to consume booking events.

**Start with Docker Compose:**

```bash
docker compose up -d rabbitmq
```

**Access RabbitMQ Management UI:**

- URL: http://localhost:15672
- Username: `jatra_user`
- Password: `jatra_password`
- VHost: `/jatra`

**Verify Connection:**

- Queue: `notification_queue`
- Exchange: `notifications` (type: topic)
- Routing Key: `booking.#`

### 2. SMTP Configuration (Optional)

Email sending is **optional**. If SMTP is not configured, notifications will be created in the database but emails won't be sent.

**Gmail Setup (Recommended):**

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:

   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. Update `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

**Other SMTP Providers:**

```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# AWS SES
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update .env with your SMTP credentials (optional)
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## Environment Variables

```env
# Server
PORT=3007
NODE_ENV=development

# Database
DATABASE_URL="postgresql://jatra_user:jatra_password@localhost:5432/jatra_db?schema=public"

# RabbitMQ (Required)
RABBITMQ_URL=amqp://jatra_user:jatra_password@localhost:5672/jatra
RABBITMQ_EXCHANGE=notifications
RABBITMQ_QUEUE=notification_queue

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=                      # Leave empty to disable email sending
SMTP_PASS=                      # Leave empty to disable email sending
SMTP_FROM=Jatra Railway <noreply@jatra-railway.com>

# Retry
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
```

## API Endpoints

### Create Notification (Manual)

```http
POST /notifications
Content-Type: application/json

{
  "userId": 1,
  "type": "BOOKING_CONFIRMED",
  "subject": "Booking Confirmed",
  "content": "Your booking has been confirmed",
  "metadata": {}
}
```

### Get User Notifications

```http
GET /notifications/user/:userId?page=1&limit=20&type=BOOKING_CONFIRMED&status=SENT
```

### Get Notification Statistics

```http
GET /notifications/user/:userId/stats
```

### Get Single Notification

```http
GET /notifications/:id
```

### Resend Failed Notification

```http
POST /notifications/:id/resend
```

## Notification Types

- `BOOKING_CONFIRMED` - Sent when booking is successfully confirmed
- `BOOKING_CANCELLED` - Sent when booking is cancelled
- `PAYMENT_FAILED` - Sent when payment fails
- `JOURNEY_REMINDER` - Sent before journey date (future feature)
- `TICKET_GENERATED` - Sent when ticket is generated (future feature)

## Notification Channels

- `EMAIL` - Email notifications (default)
- `SMS` - SMS notifications (future feature)
- `PUSH` - Push notifications (future feature)

## Notification Status

- `PENDING` - Notification created, not yet sent
- `SENT` - Successfully sent
- `FAILED` - Failed after all retry attempts
- `RETRYING` - Currently retrying after failure

## Email Templates

Templates are located in `src/templates/`:

- `booking-confirmed.hbs` - Professional booking confirmation email
- `booking-cancelled.hbs` - Booking cancellation email with refund info
- `payment-failed.hbs` - Payment failure notification

### Template Variables

**booking-confirmed.hbs:**

```javascript
{
  userName: string,
  bookingNumber: string,
  trainName: string,
  route: string,
  journeyDate: string,
  seatNumbers: string[],
  totalAmount: number
}
```

## RabbitMQ Integration

The service consumes events from the `notifications` exchange with routing pattern `booking.#`.

**Event Structure:**

```typescript
interface BookingEvent {
  type: "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "PAYMENT_FAILED";
  bookingId: number;
  userId: number;
  userEmail: string;
  userName: string;
  bookingDetails: {
    bookingNumber: string;
    journeyDate: string;
    trainName: string;
    route: string;
    seatNumbers: string[];
    totalAmount: number;
  };
  timestamp: string;
}
```

**Publishing Events** (from other services):

```typescript
// In booking-service
await rabbitMQService.publishBookingEvent({
  type: "BOOKING_CONFIRMED",
  bookingId: booking.id,
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  bookingDetails: {
    bookingNumber: booking.bookingNumber,
    journeyDate: journey.departureTime,
    trainName: train.name,
    route: `${origin.name} → ${destination.name}`,
    seatNumbers: booking.seats.map((s) => s.seatNumber),
    totalAmount: booking.totalAmount,
  },
  timestamp: new Date().toISOString(),
});
```

## Testing Without SMTP

You can test the service without configuring SMTP:

1. Leave `SMTP_USER` and `SMTP_PASS` empty in `.env`
2. Start the service - it will log a warning
3. Notifications will be created in the database with status `FAILED`
4. You can still test all REST API endpoints
5. Configure SMTP later and use the resend endpoint

## Troubleshooting

### RabbitMQ Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5672`

**Solution:**

```bash
# Start RabbitMQ
docker compose up -d rabbitmq

# Verify it's running
docker compose ps rabbitmq

# Check logs
docker compose logs rabbitmq
```

### SMTP Authentication Failed

**Error:** `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solutions:**

1. **Gmail**: Use App Password, not your account password
2. **2FA**: Enable 2-Factor Authentication first
3. **Less Secure Apps**: Disable this setting (not recommended)
4. **Leave Empty**: Set `SMTP_USER=` and `SMTP_PASS=` to disable emails

### Notifications Not Being Consumed

**Check:**

1. RabbitMQ is running
2. Exchange `notifications` exists
3. Queue `notification_queue` is bound to exchange
4. Booking service is publishing events

**Debug:**

```bash
# Check RabbitMQ logs
docker compose logs rabbitmq

# Check service logs
# Look for: "✅ Connected to RabbitMQ and listening on queue: notification_queue"
```

## Best Practices

1. **SMTP Configuration**

   - Use App Passwords, never account passwords
   - Use environment-specific credentials
   - Keep credentials in `.env`, never commit

2. **Error Handling**

   - Service continues running even if SMTP fails
   - Failed notifications are tracked in database
   - Use resend endpoint to retry failed notifications

3. **Monitoring**

   - Check notification statistics regularly
   - Monitor failed notification count
   - Review RabbitMQ queue length

4. **Performance**
   - Template caching enabled for better performance
   - Async email sending with retry mechanism
   - Database indexing on userId and status

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌────────────────┐
│ Booking Service │─────▶│   RabbitMQ   │─────▶│  Notification  │
│   (Publisher)   │      │   Exchange   │      │    Service     │
└─────────────────┘      │ notifications│      │  (Consumer)    │
                         └──────────────┘      └────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Email Service  │
                                              │   (Nodemailer)  │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  SMTP Provider  │
                                              │ (Gmail/SendGrid)│
                                              └─────────────────┘
```

## Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Related Services

- **Booking Service** (port 3005) - Publishes booking events
- **Ticket Service** (port 3006) - Can trigger ticket generation notifications
- **API Gateway** (port 3000) - Routes notification API requests

## License

MIT
