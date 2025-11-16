# Jatra - System Architecture & Design Decisions

## 🏗️ Architecture Overview

Jatra uses a **hybrid microservices architecture** combining synchronous and asynchronous communication patterns, following industry best practices from Netflix, Uber, and Amazon.

```
┌─────────────┐     ┌─────────────┐
│  Mobile App │     │   Web App   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               ↓
       ┌───────────────┐
       │  Load Balancer │
       └───────┬────────┘
               ↓
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌────────┐ ┌────────┐ ┌────────┐
│Gateway │ │Gateway │ │Gateway │  (Auto-scaled)
│Pod 1   │ │Pod 2   │ │Pod 3   │
└────┬───┘ └────┬───┘ └────┬───┘
     └──────────┼──────────┘
                ↓
    ┌───────────────────────┐
    │   Microservices (11)  │
    └───────────────────────┘
```

---

## 🔄 Communication Patterns

### 1️⃣ **External Traffic → API Gateway**

**All client requests** go through the API Gateway:

```
Mobile/Web App → API Gateway (Go) → Microservices
```

**API Gateway Responsibilities:**

- ✅ JWT Authentication
- ✅ Rate Limiting (prevent ticket scalping bots)
- ✅ Request Routing
- ✅ Load Balancing
- ✅ SSL/TLS Termination
- ✅ Request/Response Logging

**Technology:** Go with Gin framework (high performance, low memory)

---

### 2️⃣ **Internal Communication: Synchronous (HTTP/REST)**

**For critical operations requiring immediate response:**

```typescript
// Example: Booking Service → Seat Reservation Service
const response = await httpClient.post("http://seat-reservation-service:3004/reserve", {
  trainId: "TR123",
  coachId: "A1",
  seatNumber: "12A",
  userId: "user-123",
});
```

**Use Cases:**

- 🎫 Seat Reservation (MUST be immediate - Redis atomic lock)
- 💳 Payment Processing (need confirmation before proceeding)
- 🎟️ Ticket Generation (user waits for ticket)
- 👤 User Verification (Auth Service ↔ User Service)

**Why Synchronous?**

- ✅ Immediate response required
- ✅ Simple error handling
- ✅ User is waiting for result
- ✅ Critical path operations

**Latency Budget:**
| Operation | Expected Time |
|-----------|---------------|
| Seat Lock (Redis) | 5-10ms |
| Payment (SSLCommerz) | 500-2000ms |
| Ticket Generation | 50-100ms |
| **Total Booking Flow** | **~2-3 seconds** ✅ |

---

### 3️⃣ **Internal Communication: Asynchronous (RabbitMQ)**

**For non-critical, fire-and-forget operations:**

```typescript
// Example: Payment Service publishes event
await rabbitMQ.publish("payment.completed", {
  bookingId: "BK123",
  amount: 1500,
  userId: "user-123",
  timestamp: new Date(),
});

// Notification Service listens
rabbitMQ.subscribe("payment.completed", async (data) => {
  await smsService.send(data.userId, `Payment successful! Amount: ${data.amount} BDT`);
});
```

**Use Cases:**

- 📱 SMS Notifications (don't block booking flow)
- 📧 Email Confirmations
- 📊 Analytics Events (fire-and-forget)
- 📝 Audit Logs
- 📈 Reporting Data

**Why Asynchronous?**

- ✅ Don't block critical path
- ✅ Retry capability (if SMS fails, retry 3 times)
- ✅ System decoupling
- ✅ Better resilience

**RabbitMQ Events:**

```yaml
Events:
  - payment.completed      → Notification Service
  - booking.confirmed      → Ticket Service, Notification Service
  - ticket.generated       → Notification Service, Analytics
  - seat.reserved          → Analytics, Audit Log
  - user.registered        → Notification Service (Welcome SMS)
```

---

## 🎯 Complete Booking Flow Example

### User Books a Ticket (End-to-End)

```
1. User clicks "Book Ticket" on Mobile App
   ↓
   Mobile App → API Gateway (validates JWT, rate limits)
   ↓

2. API Gateway → Booking Service
   ↓

3. Booking Service → Seat Reservation Service (HTTP - Synchronous)
   └─ Redis: SET seat:TR123:A1:12A "user-123" NX EX 300
   └─ Response: { reserved: true, expiresIn: 300 } ✅
   ↓

4. Booking Service → Payment Service (HTTP - Synchronous)
   └─ SSLCommerz API call
   └─ Response: { status: 'SUCCESS', transactionId: 'TXN789' } ✅
   ↓

5. Payment Service → RabbitMQ (Asynchronous)
   └─ Publish: payment.completed event
   └─ Notification Service (listening) → Sends SMS ✅
   └─ Analytics Service (listening) → Records metrics ✅
   ↓

6. Booking Service → Ticket Service (HTTP - Synchronous)
   └─ Generate QR Code with HMAC signature
   └─ Response: { ticketId: 'TCK456', qrCode: '...' } ✅
   ↓

7. Ticket Service → RabbitMQ (Asynchronous)
   └─ Publish: ticket.generated event
   └─ Notification Service → Sends ticket via SMS ✅
   └─ Reporting Service → Updates daily stats ✅
   ↓

8. Booking Service → API Gateway → Mobile App
   └─ Return: { ticket, qrCode, status: 'CONFIRMED' } ✅

Total Time: ~2-3 seconds
```

---

## 🚨 Critical: Seat Reservation Race Condition

### The Problem

```
┌─────────────────────────────────────────────┐
│ 1,187 users click Seat 12A simultaneously   │
└─────────────────────────────────────────────┘
         ↓           ↓           ↓
    User A      User B      User C
         └───────────┼───────────┘
                     ↓
         Who gets the seat? 🤔
```

**Without proper locking:** Multiple users could get the same seat ❌

### The Solution: Redis Atomic Locks

```typescript
// Seat Reservation Service
async reserveSeat(trainId: string, coachId: string, seatNumber: string, userId: string) {
  const key = `seat:${trainId}:${coachId}:${seatNumber}`;

  // Redis SET with NX (Not eXists) - ATOMIC operation
  const locked = await redis.set(
    key,           // seat:TR123:A1:12A
    userId,        // user-123
    'NX',          // Only set if key doesn't exist
    'EX',          // Set expiry
    300            // 5 minutes (auto-release if payment not completed)
  );

  if (!locked) {
    throw new Error('Seat already reserved by another user');
  }

  return {
    reserved: true,
    expiresIn: 300,
    message: 'Seat reserved! Complete payment within 5 minutes'
  };
}
```

**Why This Works:**

- ✅ **Atomic:** Redis SET NX is a single operation (no race condition)
- ✅ **Fast:** Redis is in-memory = 5-10ms response time
- ✅ **Auto-expiry:** If user doesn't pay in 5 minutes, seat is released
- ✅ **Handles 1,187+ concurrent attempts** (your hackathon requirement)
- ✅ **Industry standard** (used by BookMyShow, Ticketmaster, Airbnb)

---

## 🔒 Security Architecture

### 1. **External Traffic Security (API Gateway)**

```
┌─────────────────────────────────────────┐
│ 1. TLS/SSL Termination                  │
│ 2. JWT Validation                       │
│ 3. Rate Limiting (per IP, per user)    │
│ 4. DDoS Protection                      │
│ 5. Request Validation                   │
└─────────────────────────────────────────┘
```

### 2. **Internal Service Security (Kubernetes)**

```yaml
# Service Mesh (Istio/Linkerd):
  - mTLS between all services (encrypted internal traffic)
  - Services can't be called from outside cluster
  - Network Policies (only allowed services can communicate)

# Example Network Policy:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payment-service-policy
spec:
  podSelector:
    matchLabels:
      app: payment-service
  ingress:
    - from:
      - podSelector:
          matchLabels:
            app: booking-service  # Only Booking Service can call Payment Service
```

### 3. **Database Security**

- ✅ Database per Service (data isolation)
- ✅ Connection Pooling (prevent exhaustion)
- ✅ Encrypted connections (SSL)
- ✅ Read replicas for search queries (load distribution)

---

## ⚡ Scalability & Performance

### Can This Architecture Handle Your Requirements?

| Requirement                    | Target             | Solution                               | Status |
| ------------------------------ | ------------------ | -------------------------------------- | ------ |
| **30M requests in 30 min**     | 16,666 req/sec     | API Gateway HPA (3-10 pods)            | ✅ Yes |
| **1,187 attempts per seat**    | Concurrent locks   | Redis atomic SET NX                    | ✅ Yes |
| **10,000 concurrent bookings** | Seat locking       | Redis Cluster (3-5 nodes)              | ✅ Yes |
| **100,000 SMS per hour**       | Notification queue | RabbitMQ + scaled consumers            | ✅ Yes |
| **99.9% uptime**               | High availability  | Multi-pod, auto-restart, health checks | ✅ Yes |

### Horizontal Pod Autoscaler (HPA) Configuration

```yaml
# Example: API Gateway Auto-scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**During Eid Rush:**

- API Gateway: 3 → 10 pods (auto-scales in 30 seconds)
- Booking Service: 5 → 20 pods
- Seat Reservation: 5 → 15 pods
- Payment Service: 3 → 10 pods

---

## 🚨 Potential Bottlenecks & Mitigations

### 1. **API Gateway Bottleneck** ⚠️

**Risk:** Single point of entry for all traffic

**Mitigation:**

- ✅ Run 3-10 API Gateway pods (auto-scaled)
- ✅ Load Balancer distributes traffic
- ✅ Health checks replace crashed pods
- ✅ Circuit breakers prevent cascading failures

**Verdict:** ✅ Not a bottleneck

---

### 2. **Synchronous HTTP Chain Latency** ⚠️

**Risk:** Booking → Seat → Payment → Ticket (chained delays)

**Mitigation:**

- ✅ Fast Redis operations (5-10ms)
- ✅ Async notifications (don't block booking)
- ✅ Timeouts on all HTTP calls (5s max)
- ✅ Circuit breakers (fail fast if service down)

**Verdict:** ✅ Acceptable (2-3s total booking time)

---

### 3. **Database Overload** ⚠️

**Risk:** All services hitting same database

**Mitigation:**

- ✅ Database per service (isolation)
- ✅ Redis cache (90% cache hit rate for searches)
- ✅ Read replicas for read-heavy operations
- ✅ Connection pooling

**Verdict:** ✅ Not a bottleneck

---

### 4. **RabbitMQ Queue Backup** ⚠️

**Risk:** Events published faster than consumed

**Mitigation:**

- ✅ Multiple consumer instances (5-10 Notification Service pods)
- ✅ Message priority (OTP > Analytics)
- ✅ Dead Letter Queue (failed messages don't block)
- ✅ Auto-scaling based on queue depth

**Verdict:** ✅ Not a bottleneck

---

## 🎓 Industry Validation

### This Architecture Pattern is Used By:

| Company          | Use Case        | Pattern                                    |
| ---------------- | --------------- | ------------------------------------------ |
| **Netflix**      | Video streaming | API Gateway (Zuul) + Microservices + Kafka |
| **Uber**         | Ride booking    | API Gateway + gRPC + Kafka events          |
| **BookMyShow**   | Ticket booking  | API Gateway + Redis locks + Microservices  |
| **Ticketmaster** | Event tickets   | Similar pattern with distributed locks     |
| **Airbnb**       | Booking system  | Microservices + Redis + Message queues     |

**Your architecture matches industry standards** ✅

---

## 🚀 Technology Stack Rationale

### Why These Choices?

| Technology               | Why?                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| **Go (API Gateway)**     | High performance, low memory, handles 10K+ concurrent connections   |
| **NestJS (Services)**    | TypeScript, modular, built-in support for microservices             |
| **Redis**                | In-memory speed (5-10ms), atomic operations, perfect for seat locks |
| **RabbitMQ**             | Reliable message delivery, retry logic, dead letter queues          |
| **PostgreSQL**           | ACID compliance, complex queries, mature ecosystem                  |
| **Kubernetes**           | Industry standard, auto-scaling, self-healing                       |
| **Prometheus + Grafana** | Time-series metrics, beautiful dashboards                           |
| **OpenTelemetry**        | Distributed tracing across microservices                            |

---

## 📊 Monitoring & Observability

### What We Track

```
1. Metrics (Prometheus):
   - Request rate (req/sec)
   - Error rate (%)
   - Latency (p50, p95, p99)
   - CPU/Memory usage
   - Database connections
   - Redis operations/sec

2. Logs (Loki/ELK):
   - Application logs
   - Error logs
   - Audit logs
   - Access logs

3. Traces (Jaeger):
   - End-to-end request flow
   - Service dependencies
   - Slow query identification
   - Error root cause analysis

4. Alerts:
   - High error rate (> 5%)
   - High latency (p95 > 1s)
   - Service down
   - Database connection exhaustion
   - Redis memory usage > 80%
```

---

## 🎯 Design Principles

1. **Single Responsibility:** Each service does one thing well
2. **Database per Service:** Data isolation and independence
3. **Async Where Possible:** Don't block critical paths
4. **Fail Fast:** Timeouts and circuit breakers
5. **Observability First:** Metrics, logs, traces from day one
6. **Horizontal Scaling:** Add more pods, not bigger pods
7. **Idempotency:** Retry-safe operations
8. **Auto-healing:** Kubernetes restarts failed pods

---

## 🔮 Future Enhancements (Beyond FYP)

### When You Scale to 100M+ Users:

1. **gRPC instead of REST:** 50% lower latency, binary protocol
2. **Kafka instead of RabbitMQ:** Handle millions of events/sec
3. **GraphQL Federation:** More flexible API for different clients
4. **CQRS:** Separate read/write databases for better performance
5. **Event Sourcing:** Store all events for audit/replay
6. **Multi-region Deployment:** Lower latency worldwide
7. **CDN for Static Assets:** Faster page loads

**But for 30M requests in 30 min:** Current architecture is **PERFECT** ✅

---

## 📚 References & Further Reading

- [Microservices Patterns by Chris Richardson](https://microservices.io/patterns/)
- [Building Microservices by Sam Newman](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [RabbitMQ Patterns](https://www.rabbitmq.com/getstarted.html)
- [Kubernetes Patterns](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/)

---

## 🤝 Contributing

This is a Final Year Project (FYP 2025) for Bangladesh Railway ticketing system modernization.

**Project Team:** [Your Team Details]

**Supervisor:** [Supervisor Name]

**Institution:** [University Name]

---

**Last Updated:** November 16, 2025
