# Testing and Validation Guide

## Overview

This document outlines the testing strategy for the Jatra Railway booking system, focusing on HTTP retry logic, RabbitMQ event propagation, and end-to-end booking flows.

---

## 1. HTTP Retry Logic Testing

### 1.1 Exponential Backoff Verification

**Test Configuration:**

```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  timeoutMs: 15000-30000 (operation dependent)
}
```

**Test Scenarios:**

#### Scenario 1: Successful First Attempt

```bash
# Expected behavior:
1. Request completes immediately
2. No retry attempts
3. Log: "✅ Request succeeded on first attempt"
```

#### Scenario 2: Transient 5xx Error with Recovery

```bash
# Steps:
1. Stop seat-reservation-service temporarily
2. Create booking
3. Observe retry attempts in logs
4. Restart seat-reservation-service before timeout
5. Booking should succeed after retry

# Expected behavior:
- Attempt 1 → 503 Service Unavailable → wait 1s
- Attempt 2 → 503 Service Unavailable → wait 2s
- Attempt 3 → 200 OK → Success
- Log: "✅ Request succeeded after 3 attempts"
```

#### Scenario 3: 4xx Client Error (No Retry)

```bash
# Steps:
1. Create booking with invalid seat IDs
2. Observe immediate failure

# Expected behavior:
- Attempt 1 → 400 Bad Request → Fail immediately
- No retry attempts
- Log: "❌ Client error (4xx), not retrying"
```

#### Scenario 4: Timeout Handling

```bash
# Steps:
1. Simulate slow payment service response (>30s)
2. Create booking with payment initiation

# Expected behavior:
- Request times out after 20s (payment timeout)
- Retry with exponential backoff
- After 3 attempts, throw timeout error
- Log: "❌ Request timeout after 20000ms"
```

#### Scenario 5: All Retries Exhausted

```bash
# Steps:
1. Keep seat-reservation-service down
2. Create booking
3. Observe all retry attempts fail

# Expected behavior:
- Attempt 1 → fail → wait 1s
- Attempt 2 → fail → wait 2s
- Attempt 3 → fail → wait 4s
- Attempt 4 → fail → throw error
- Log: "❌ All 3 retry attempts failed for Seat Reservation Service"
- Rollback: Release seats (if any were locked)
```

### 1.2 Retry Logic Code Verification

**Check HttpRetryService:**

```typescript
// apps/booking-service/src/common/http-retry.service.ts

// ✅ Verify exponential backoff calculation:
const delay = Math.min(config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1), config.maxDelayMs);

// ✅ Verify 4xx errors don't retry:
if (error.response?.status >= 400 && error.response?.status < 500) {
  throw error; // Don't retry client errors
}

// ✅ Verify timeout handling:
const timeoutPromise = this.createTimeoutPromise(config.timeoutMs);
const result = await Promise.race([requestFn(), timeoutPromise]);
```

---

## 2. RabbitMQ Event Propagation Testing

### 2.1 Event Flow Verification

#### Test: Booking Confirmed Event

```bash
# Steps:
1. Create booking → Get booking ID
2. Confirm payment
3. Check RabbitMQ Management UI
4. Check notification-service logs
5. Check ticket-service logs

# Expected event flow:
Booking Service
  ↓ (emits: booking.confirmed)
  ├─→ Notification Service
  │   └─ Creates notification record
  │   └─ Sends confirmation email
  └─→ Ticket Service
      └─ Generates QR code ticket

# Verification:
- RabbitMQ: 1 message published to booking.exchange
- RabbitMQ: 2 messages consumed (notification + ticket queues)
- Database: New notification record with type 'BOOKING_CONFIRMED'
- Database: New ticket record with QR code
- Email: Confirmation sent to user
```

#### Test: Payment Completed Event

```bash
# Steps:
1. Payment service confirms payment
2. Check RabbitMQ logs
3. Check notification-service logs

# Expected event flow:
Payment Service
  ↓ (emits: payment.completed)
  └─→ Notification Service
      └─ Sends payment success notification

# Verification:
- RabbitMQ: 1 message published to payment.exchange
- Notification created with type 'PAYMENT_COMPLETED'
```

#### Test: Booking Cancelled Event

```bash
# Steps:
1. Create and confirm booking
2. Cancel booking with reason
3. Check RabbitMQ logs
4. Check notification-service logs

# Expected event flow:
Booking Service
  ↓ (emits: booking.cancelled)
  └─→ Notification Service
      └─ Sends cancellation email

# Verification:
- RabbitMQ: 1 message published to booking.exchange
- Notification created with type 'BOOKING_CANCELLED'
- Email sent with cancellation reason
```

### 2.2 RabbitMQ Configuration Verification

**Check exchanges exist:**

```bash
# RabbitMQ Management UI → Exchanges tab
- booking.exchange (type: topic, durable: true)
- payment.exchange (type: topic, durable: true)
- notification.exchange (type: topic, durable: true)
```

**Check queues exist:**

```bash
# RabbitMQ Management UI → Queues tab
- notification.queue (durable: true, consumers: 1)
- ticket.queue (durable: true, consumers: 1)
```

**Check bindings:**

```bash
# notification.queue bindings:
- booking.exchange → booking.confirmed
- booking.exchange → booking.cancelled
- payment.exchange → payment.completed
- payment.exchange → payment.failed

# ticket.queue bindings:
- booking.exchange → booking.confirmed
```

### 2.3 Event Format Verification

**Check event structure:**

```typescript
interface BookingConfirmedEvent {
  eventId: string; // UUID v4
  eventType: "booking.confirmed";
  timestamp: Date; // ISO 8601
  source: "booking-service";
  data: {
    bookingId: string;
    userId: string;
    email: string;
    phone: string;
    journeyId: string;
    totalAmount: number;
    seats: Array<{
      seatId: string;
      seatNumber: string;
      coachNumber: string;
    }>;
  };
}
```

**Verify in RabbitMQ:**

```bash
# Get message from queue (without ack):
curl -u guest:guest \
  -X POST http://localhost:15672/api/queues/%2F/notification.queue/get \
  -H "Content-Type: application/json" \
  -d '{"count":1,"ackmode":"ack_requeue_true","encoding":"auto"}'

# Verify fields:
- eventId matches UUID pattern
- timestamp is valid ISO 8601
- eventType is correct routing key
- data contains all required fields
```

---

## 3. End-to-End Booking Flow Testing

### 3.1 Happy Path: Successful Booking

```bash
# Test script: test-booking-flow.sh

# Step 1: Create Booking
POST /bookings
{
  "userId": "user-123",
  "journeyId": "journey-456",
  "seatIds": ["seat-1", "seat-2"],
  "fromStationId": "station-dhaka",
  "toStationId": "station-chittagong",
  "totalAmount": 1500,
  "paymentMethod": "BKASH",
  "paymentDetails": { "phoneNumber": "+8801712345678" }
}

# Expected HTTP calls (with retry):
1. POST seat-reservation-service/locks/acquire (15s timeout, 3 retries)
2. POST payment-service/payments/initiate (20s timeout, 3 retries)

# Expected result:
- Booking created with status: PAYMENT_PENDING
- Seats locked for 15 minutes
- Payment record created with status: PENDING

# Step 2: Confirm Payment
POST /bookings/:id/confirm
{
  "paymentId": "payment-123",
  "transactionId": "bkash-trx-456"
}

# Expected HTTP calls (with retry):
1. POST payment-service/payments/confirm (20s timeout, 3 retries)
2. POST seat-reservation-service/reservations/confirm (15s timeout, 3 retries)

# Expected result:
- Booking status: CONFIRMED
- Payment status: COMPLETED
- Reservation status: CONFIRMED
- RabbitMQ event: booking.confirmed
- Notification sent
- Ticket generated with QR code

# Step 3: Get Booking Status
GET /bookings/:id/status

# Expected result:
{
  "id": "...",
  "status": "CONFIRMED",
  "journey": {
    "trainName": "Suborno Express",
    "trainNumber": "SUBORNO-EXPRESS-701",
    "departureTime": "2025-11-29T08:00:00Z",
    "arrivalTime": "2025-11-29T15:00:00Z"
  },
  "seats": [...],
  "payment": {
    "status": "COMPLETED",
    "amount": 1500,
    "method": "BKASH"
  }
}
```

### 3.2 Failure Path: Payment Initiation Fails

```bash
# Step 1: Create Booking (payment service down)
POST /bookings
# ... same payload

# Expected behavior:
1. Seats locked successfully
2. Payment initiation fails after 3 retries (1s, 2s, 4s)
3. Rollback: Release seats automatically
4. HTTP 503: "Failed to create booking"

# Expected logs:
- "✅ Seats locked: <reservation-id>"
- "⚠️ Retrying request to Payment Service (1/3) after 1000ms"
- "⚠️ Retrying request to Payment Service (2/3) after 2000ms"
- "⚠️ Retrying request to Payment Service (3/3) after 4000ms"
- "❌ All retry attempts failed for Payment Service"
- "🔄 Rolling back seat lock: <reservation-id>"
- "✅ Seats released after payment failure"
```

### 3.3 Failure Path: Seat Lock Fails

```bash
# Step 1: Create Booking (seat service down)
POST /bookings
# ... same payload

# Expected behavior:
1. Seat lock fails after 3 retries
2. No payment initiation (fails early)
3. HTTP 503: "Failed to create booking"

# Expected logs:
- "⚠️ Retrying request to Seat Reservation Service (1/3)"
- "⚠️ Retrying request to Seat Reservation Service (2/3)"
- "⚠️ Retrying request to Seat Reservation Service (3/3)"
- "❌ All retry attempts failed for Seat Reservation Service"
- "❌ Booking creation failed"
```

### 3.4 Cancellation Flow

```bash
# Step 1: Cancel Confirmed Booking
POST /bookings/:id/cancel
{
  "reason": "User requested cancellation"
}

# Expected HTTP calls (with retry):
1. POST payment-service/payments/:id/refund (20s timeout, 3 retries)
2. POST seat-reservation-service/reservations/:id/cancel (15s timeout, 3 retries)

# Expected result:
- Booking status: CANCELLED
- Payment refund initiated
- Seats released
- RabbitMQ event: booking.cancelled
- Cancellation notification sent
```

---

## 4. Performance and Load Testing

### 4.1 Retry Performance Impact

**Test: Measure retry overhead**

```bash
# Without retry (direct success):
- Average latency: ~200ms
- p95: ~300ms
- p99: ~500ms

# With 1 retry (2nd attempt succeeds):
- Average latency: ~1,200ms (200ms + 1s backoff)
- Additional overhead: ~1s

# With 2 retries (3rd attempt succeeds):
- Average latency: ~3,200ms (200ms + 1s + 2s backoff)
- Additional overhead: ~3s

# Recommendation: Monitor retry rates
# Alert if >10% of requests require retries
```

### 4.2 RabbitMQ Throughput

**Test: Event publishing rate**

```bash
# Create 100 bookings rapidly
# Measure:
- Event publishing latency: <10ms per event
- Consumer processing time: <100ms per event
- No message loss
- No duplicate processing

# Expected RabbitMQ metrics:
- Publish rate: >100 msg/s
- Consume rate: >100 msg/s
- Queue length: 0 (consumers keep up)
```

---

## 5. Manual Testing Checklist

### Pre-requisites

- [ ] All services running (auth, booking, payment, seat, notification, ticket)
- [ ] PostgreSQL database migrated
- [ ] RabbitMQ running with management UI
- [ ] Environment variables configured

### Test Cases

#### ✅ Test 1: Create Booking (Success)

- [ ] Seats locked successfully
- [ ] Payment initiated successfully
- [ ] Booking created with PAYMENT_PENDING status
- [ ] No RabbitMQ events emitted yet

#### ✅ Test 2: Confirm Booking (Success)

- [ ] Payment confirmed successfully
- [ ] Reservation confirmed successfully
- [ ] Booking status updated to CONFIRMED
- [ ] booking.confirmed event published
- [ ] Notification email sent
- [ ] Ticket generated with QR code

#### ✅ Test 3: Cancel Booking (Success)

- [ ] Payment refunded successfully
- [ ] Reservation cancelled successfully
- [ ] Booking status updated to CANCELLED
- [ ] booking.cancelled event published
- [ ] Cancellation email sent

#### ✅ Test 4: Retry Logic (5xx Error)

- [ ] First attempt fails with 503
- [ ] Retry after 1s
- [ ] Second attempt succeeds
- [ ] Logs show retry attempts

#### ✅ Test 5: No Retry (4xx Error)

- [ ] Request fails with 400
- [ ] No retry attempts
- [ ] Error immediately returned

#### ✅ Test 6: Timeout Handling

- [ ] Request times out after configured duration
- [ ] Retry with backoff
- [ ] Final timeout error after all retries

#### ✅ Test 7: RabbitMQ Event Flow

- [ ] Events appear in RabbitMQ UI
- [ ] Correct routing keys used
- [ ] Consumers process events
- [ ] No dead letters

#### ✅ Test 8: Database Consistency

- [ ] Booking records created correctly
- [ ] Relations properly loaded
- [ ] No orphaned records after rollback

---

## 6. Automated Testing (Future)

### 6.1 Unit Tests

```typescript
// http-retry.service.spec.ts
describe("HttpRetryService", () => {
  it("should retry on 5xx errors", async () => {
    // Mock HttpService to fail twice, then succeed
    // Assert: 3 total attempts
  });

  it("should not retry on 4xx errors", async () => {
    // Mock HttpService to return 400
    // Assert: 1 attempt only
  });

  it("should apply exponential backoff", async () => {
    // Mock failures and measure delays
    // Assert: 1s, 2s, 4s delays
  });
});
```

### 6.2 Integration Tests

```typescript
// bookings.service.integration.spec.ts
describe("Bookings Service", () => {
  it("should create booking with retry on transient failure", async () => {
    // Start/stop seat service to simulate transient failure
    // Assert: Booking created after retry
  });

  it("should emit RabbitMQ event on confirmation", async () => {
    // Create and confirm booking
    // Assert: Event published to booking.exchange
  });
});
```

### 6.3 E2E Tests

```typescript
// booking-flow.e2e.spec.ts
describe("Booking Flow E2E", () => {
  it("should complete full booking flow", async () => {
    // Create → Confirm → Verify notifications and ticket
  });
});
```

---

## 7. Monitoring and Observability

### 7.1 Metrics to Track

```
# HTTP Retry Metrics:
- http_retry_attempts_total (counter)
- http_retry_success_after_retry (counter)
- http_retry_all_failed (counter)
- http_retry_duration_seconds (histogram)

# RabbitMQ Metrics:
- rabbitmq_events_published_total (counter)
- rabbitmq_events_consumed_total (counter)
- rabbitmq_consumer_errors_total (counter)

# Business Metrics:
- bookings_created_total (counter)
- bookings_confirmed_total (counter)
- bookings_cancelled_total (counter)
- booking_creation_duration_seconds (histogram)
```

### 7.2 Alerts

```yaml
# High retry rate (>10%)
- alert: HighRetryRate
  expr: rate(http_retry_attempts_total[5m]) > 0.1

# RabbitMQ message lag
- alert: RabbitMQMessageLag
  expr: rabbitmq_queue_messages > 100

# Failed bookings spike
- alert: BookingFailureSpike
  expr: rate(bookings_failed_total[5m]) > 0.05
```

---

## Summary

✅ **Completed:**

1. HTTP retry logic with exponential backoff
2. RabbitMQ event-driven architecture
3. Prisma schema relation fixes
4. Manual test script

📋 **Next Steps:**

1. Run manual test script to verify flows
2. Test retry logic with simulated failures
3. Monitor RabbitMQ event propagation
4. Add automated unit/integration tests
5. Set up monitoring and alerting
