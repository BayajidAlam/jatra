# Jatra - Scalable Railway Ticketing System

## BSc Project Proposal Defense Presentation

**Student Name:** Bayajid Alam  
**Student ID:** [Your ID]  
**Supervisor:** [Supervisor Name]  
**Department:** Computer Science & Engineering  
**Institution:** [Your University Name]  
**Session:** 2024-2025  
**Defense Date:** [To be scheduled]

---

## Slide 1: Title & Context

# 🚂 **Jatra**

## Scalable, Fault-Tolerant Railway Ticketing System for Bangladesh Railway

### Solving the National Eid Rush Crisis

**A Kubernetes-Native Microservices Platform**  
_Handling 30M+ Hits in 30 Minutes with 1,187+ Concurrent Seat Attempts_

---

**Inspired by:** BUET CSE Hackathon 2024 (Microservice & DevOps Challenge)  
**Project Type:** Real-World Problem Solving with Industry Validation  
**GitHub:** https://github.com/BayajidAlam/jatra

---

## Slide 2: Problem Background & Motivation

### The National Crisis: Eid Train Ticket Rush

**Context:**  
Every year during Eid-ul-Fitr and Eid-ul-Azha, millions of Bangladeshis travel from cities to their hometowns using Bangladesh Railway. The online ticketing system, operated by Shohoz-Synesis-Vincen Joint Venture, experiences catastrophic failures during these peak periods.

### Real-World Impact: Masum's Story

**Masum**, a software engineer at Pridesys IT, wanted to book a train ticket from Dhaka to Chittagong for Eid. Despite logging in early and being quick to select a seat:

1. ✅ **Successfully logged in** and found available seats
2. ✅ **Selected seat quickly** (first attempt)
3. ❌ **Waited 5+ minutes** for OTP (never received)
4. ❌ **Website froze** during multiple retry attempts
5. ❌ **Booking failed repeatedly** despite payment readiness
6. ❌ **Unable to go home** for Eid celebration with family

**He wasn't alone** - thousands of citizens faced identical issues, leading to national frustration and social media outcry.

### Verified Crisis Statistics (2024)

| Date                   | Total Hits     | Time Window    | Attempts per Seat | Tickets Available | Success Rate |
| ---------------------- | -------------- | -------------- | ----------------- | ----------------- | ------------ |
| **March 28** (Day 5)   | 16.8 million   | 30 minutes     | 600+              | ~28,000           | 40-50%       |
| **March 29** (Day 6)   | 22.4 million   | 30 minutes     | 500+              | 32,587            | 30-40%       |
| **Eid-ul-Azha** (Peak) | **30 million** | **30 minutes** | **1,187+**        | ~25,000           | **10-20%**   |

**Source:** Dhaka Tribune, Prothom Alo (Verified Media Reports)

### Problem Scope

**Daily Operations:**

- 80,000-100,000 tickets sold per day (normal periods)
- 1.4 million registered users across 77 stations nationwide
- Tk 20 service charge per ticket (Tk 584M annual revenue for Shohoz)

**The Challenge:**  
Current system **cannot handle** extreme traffic surges, resulting in:

- **60-90% booking failure rate** during peak periods
- **5+ minute OTP delays** causing booking timeouts
- **System crashes and freezes** under load
- **Unfair ticket distribution** and black market exploitation

---

## Slide 3: Current System Failures (Shohoz Analysis)

### Technical Failures

**System Architecture Issues:**

- ❌ **Monolithic architecture** (suspected) - single point of failure
- ❌ **No horizontal auto-scaling** - fixed server capacity
- ❌ **Database bottleneck** - single PostgreSQL instance, no read replicas
- ❌ **Inadequate caching** - Redis cache exhaustion under load
- ❌ **No circuit breakers** - cascading failures across system

**Performance Problems:**

- OTP delivery delays: **5+ minutes** (should be < 30 seconds)
- Website freezing and crashes during peak traffic
- Session timeouts causing booking loss
- Payment transaction failures and rollback issues

**Observed Success Rates:**

- Normal days: **95%+** success ✅
- Moderate Eid rush: **60-70%** success ⚠️
- Peak Eid rush: **30-40%** success ❌
- Extreme peak: **10-20%** success 🚨

### Operational & Legal Issues

**Black Market Ticketing (March 2024):**

- **4 Shohoz employees arrested** by RAB for black market syndicate
- **5 external operators arrested** for unauthorized ticket reselling
- Insider access abuse for ticket hoarding
- System vulnerabilities exploited for profit

**Consumer Rights Violations:**

- **Tk 2 lakh fine** imposed by Consumer Rights Protection Directorate
- Arbitrary ticket cancellations without justification
- Payment deducted but tickets not issued
- Unresponsive customer support during crisis

**Financial Issues:**

- **Tk 25 crore advertising revenue** lost to Bangladesh Railway (excluded from tender)
- High service charge: **Tk 20 per ticket** (vs Tk 0.25 processing fee)
- Revenue prioritization over user experience

### Industry Comparison

| System             | Peak Capacity  | Success Rate | Architecture        | Auto-Scaling |
| ------------------ | -------------- | ------------ | ------------------- | ------------ |
| **IRCTC (India)**  | 50M+ hits/hour | 85%+         | Microservices + CDN | ✅ Yes       |
| **Trainline (UK)** | 20M+ hits/hour | 95%+         | Cloud-native K8s    | ✅ Yes       |
| **Amtrak (USA)**   | 10M+ hits/hour | 90%+         | Multi-region        | ✅ Yes       |
| **Shohoz (BD)**    | 30M hits/30min | 10-40%       | Monolithic          | ❌ No        |

**Gap Identified:** Bangladesh needs a modern, scalable, microservices-based system that matches international standards.

---

## Slide 4: Objectives & Success Criteria

### Condensed Objectives

- **Scalability:** Handle 50,000+ concurrent users and 1,187+ attempts per seat
- **Reliability:** Maintain 99.9% uptime and prevent system crashes during Eid
- **Fairness:** Guarantee no double-booking via atomic seat locking
- **User Experience:** Complete bookings in < 3 seconds with fast OTP and QR tickets
- **Modern Architecture:** Kubernetes-native microservices with per-service databases
- **Operability:** Strong monitoring, tracing, CI/CD and IaC for production readiness

### Key Success Metrics

| Metric                | Target        | Current Shohoz         |
| --------------------- | ------------- | ---------------------- |
| Peak Traffic Handling | 50M hits/hour | 30M hits/30min (crash) |
| Success Rate          | ≥ 99.9%       | 10–40%                 |
| Booking Time          | < 3 seconds   | 30+ seconds            |
| OTP Delivery          | < 30 seconds  | 5+ minutes             |
| Seat Lock Time        | < 10ms        | Unspecified / fails    |
| System Uptime         | 99.9%         | 60–70% during peak     |

---

## Slide 5: Project Origin & Validation

### BUET CSE Hackathon 2024: Industry Validation

**Event Details:**

- **Name:** Microservice & DevOps Problem Statement Hackathon
- **Date:** October 24, 2024
- **Location:** Department of Computer Science and Engineering, BUET
- **Duration:** 24 hours
- **Participants:** University students across Bangladesh

**Problem Statement:**  
_"Develop a scalable and robust system that can handle lots of traffic and ensure a smooth flow towards buying train tickets online, specifically addressing the 30M+ hits in 30 minutes scenario with 1,187+ attempts per seat."_

### Hackathon Requirements (Addressed in Jatra)

- **System Design:** Microservice identification, architecture & data models for 1,000+ attempts/seat
- **Implementation:** Core services, Dockerized, single base URL, REST + RabbitMQ
- **DevOps:** CI/CD pipeline, zero-downtime deployment, smart service detection
- **Load Testing:** Breakpoint tests on seat selection with 500–5,000+ users
- **Bonus:** IaC (Pulumi), Kubernetes + Helm, monitoring, tracing, extra load tests

**Validation:** The hackathon problem statement proves the **real-world relevance**, and Jatra’s design directly satisfies all milestones and bonus tasks.

---

## Slide 6: Literature Review & Related Work

### Key Findings (Condensed)

- **High-concurrency systems:** Redis atomic operations are ~10x faster than DB locks → supports our seat-locking choice.
- **Microservices:** Database-per-service improves isolation and scalability → aligns with our 11-database design.
- **Event-driven design:** Queues (RabbitMQ) decouple services and improve resilience → used for notifications/reporting.
- **Auto-scaling:** Kubernetes HPA significantly reduces cost vs fixed servers → core of our scalability strategy.

### Existing Systems & Gaps

- **Shohoz:** Proprietary, frequent crashes, no auto-scaling.
- **BookMyShow/Ticketmaster/IRCTC:** Proven microservice systems but not BD-specific, closed source or legacy.
- **Gaps:** No open, Bangladesh-focused, high-traffic railway ticketing solution with Redis-based seat locking and K8s.

**Jatra** directly targets these gaps with a Bangladesh-ready, cloud-native architecture.

---

## Slide 7: Proposed Solution - Jatra Platform

### Solution Overview

**Jatra** (জাত্রা - Bengali for "journey") is a cloud-native, microservices-based railway ticketing platform designed to handle extreme traffic surges while maintaining high availability and user experience.

### Core Innovations

**1. Redis Atomic Seat Locking**

```redis
SET seat:train_123_coach_A_seat_42 user:456 NX EX 300
```

- **NX (Not Exists):** Only sets value if key doesn't exist (atomic guarantee)
- **EX 300:** Expires in 300 seconds (5 minutes - automatic timeout)
- **Performance:** 5-10ms response time vs 100-500ms for database locks
- **Scalability:** Handles 1,187+ concurrent attempts per seat successfully

**How It Works:**

1. User selects seat → Seat Reservation Service requests Redis lock
2. Redis atomically checks if seat is available and locks it (single operation)
3. If successful: Seat held for 5 minutes for that user
4. If failed: Immediately return "Seat Unavailable"
5. On payment success: Release lock and confirm booking in database
6. On timeout: Redis automatically releases lock (TTL expiry)

**Why This Solves the Problem:**

- ✅ **Race condition prevention:** Atomic operation prevents double booking
- ✅ **High performance:** 5-10ms locking time vs 100-500ms DB locks
- ✅ **Automatic cleanup:** TTL ensures locks don't persist if user abandons
- ✅ **Proven at scale:** Used by BookMyShow, Uber, Amazon for similar problems

**2. Kubernetes Auto-Scaling**

- **Horizontal Pod Autoscaler (HPA):** Automatically adds/removes pods based on CPU/memory
- **Seat Reservation Service:** 5-20 pods (scales up during peak, down during normal)
- **API Gateway:** 3-10 pods
- **Other Services:** 3-10 pods
- **Cluster Autoscaler:** Adds new nodes if pods are pending

**Scaling Trigger:**

```yaml
CPU Utilization > 70% → Add pods
CPU Utilization < 30% → Remove pods (after cooldown)
```

**3. Database-per-Service Pattern**

- Each microservice has its own PostgreSQL database
- **Benefits:** Fault isolation, independent scaling, technology flexibility
- **Databases:** auth_db, user_db, schedule_db, seat_reservation_db, booking_db, payment_db, ticket_db, notification_db, admin_db, reporting_db, search_db

**4. Hybrid Communication Architecture**

- **API Gateway (Go):** External entry point, JWT validation, rate limiting
- **Synchronous (HTTP/REST):** For critical path (auth, seat reservation, booking)
- **Asynchronous (RabbitMQ):** For non-blocking operations (notifications, reporting, ticket generation)

**Why Hybrid?**

- Critical operations (seat booking) need immediate response → HTTP
- Background tasks (email, SMS) don't block user → RabbitMQ
- Reduces latency by avoiding unnecessary message queue overhead on critical path

**5. Comprehensive Observability**

- **Prometheus:** Collects metrics every 15 seconds from all services
- **Grafana:** Visualizes dashboards (system health, business metrics)
- **Jaeger:** Distributed tracing to debug cross-service issues
- **Loki:** Centralized log aggregation for troubleshooting
- **OpenTelemetry:** Standardized instrumentation across all services

### System Architecture (High Level)

Use the **System Overview Architecture** diagram from `ARCHITECTURE_VISUAL.md` on this slide to visually show:

- Clients → Load Balancer → API Gateway
- 11 microservices (Auth, Seat Reservation, Booking, Payment, Ticket, etc.)
- Data layer: PostgreSQL (11 DBs), Redis, RabbitMQ

---

## Slide 8: Key Innovation – Atomic Seat Locking

### The Critical Problem

**1,187 users click the same seat simultaneously** ❌

### Our Solution: Redis Atomic Locks

```typescript
// Seat Reservation Service
async reserveSeat(trainId, coachId, seatNumber, userId) {
  const key = `seat:${trainId}:${coachId}:${seatNumber}`;

  // Atomic operation - ONLY ONE user succeeds
  const locked = await redis.set(
    key,
    userId,
    'NX',  // Not eXists - only set if key doesn't exist
    'EX',  // Expiry
    300    // 5 minutes auto-release
  );

  if (!locked) {
    throw new Error('Seat already reserved');
  }

  return { reserved: true, expiresIn: 300 };
}
```

**Why This Works:**

- ✅ Atomic (no race condition)
- ✅ Fast (5-10ms in Redis)
- ✅ Auto-expiry (seat released if payment not completed)
- ✅ Handles 1,187+ concurrent attempts

---

## Slide 9: System Architecture Details

### Microservices (11 Services)

| Service                  | Responsibility         | Technology     | Replicas |
| ------------------------ | ---------------------- | -------------- | -------- |
| **API Gateway**          | Routing, rate limiting | Go (Gin)       | 3-10     |
| **Auth Service**         | Login, JWT, OTP        | NestJS         | 3-10     |
| **Seat Reservation**     | Atomic locks           | NestJS + Redis | 5-20     |
| **Booking Service**      | Orchestration          | NestJS         | 3-15     |
| **Payment Service**      | SSLCommerz             | NestJS         | 3-10     |
| **Ticket Service**       | QR generation          | NestJS         | 3-10     |
| **Notification Service** | SMS/Email              | NestJS         | 5-15     |
| **Search Service**       | Train search           | NestJS         | 3-15     |
| **Schedule Service**     | Train data             | NestJS         | 2-8      |
| **User Service**         | Profiles               | NestJS         | 2-8      |
| **Admin Service**        | Management             | NestJS         | 2-5      |

**Auto-scales based on CPU/Memory (Kubernetes HPA)**

---

## Slide 10: Technology Stack

### Backend

- **Runtime:** Node.js 20+ (NestJS), Go 1.21+ (API Gateway)
- **Framework:** NestJS (TypeScript), Gin (Go)
- **API:** REST APIs
- **Validation:** class-validator, class-transformer

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui

### Databases

- **Relational:** PostgreSQL 15+ (11 databases, 40+ tables)
- **Cache:** Redis 7+ Cluster (seat locks, OTP, search cache)
- **Message Queue:** RabbitMQ 3.12+ (async notifications)

### DevOps & Infrastructure

- **Container:** Docker, Docker Compose
- **Orchestration:** Kubernetes 1.28+ with Helm Charts
- **CI/CD:** Jenkins
- **Monitoring:** Prometheus + Grafana + Jaeger (tracing)
- **Cloud:** AWS/Azure/GCP (deployment ready)

### Development Tools

- **Monorepo:** Nx Workspace (smart builds)
- **Package Manager:** pnpm

---

## Slide 11: Data & Communication Architecture

Use a combined slide (plus diagram from `ARCHITECTURE_VISUAL.md`) to briefly cover:

- **Databases:** 11 PostgreSQL DBs (auth, user, schedule, seat_reservation, booking, payment, ticket, notification, reporting, admin, search)
- **Redis:** seat locks, OTP, caches (key patterns only if space allows)
- **Synchronous HTTP:** critical path (auth, search, seat reservation, booking, payment)
- **Asynchronous Events:** RabbitMQ for notifications, reporting, ticket generation

---

## Slide 12: End-to-End Booking Flow

### User Journey (2-3 seconds total)

```
1. User Login (Auth Service)
   ↓ JWT Token

2. Search Trains (Search Service + Redis Cache)
   ↓ Available trains

3. Select Seat → Reserve (Seat Reservation Service)
   ↓ Redis Atomic Lock (5-10ms)

4. Initiate Payment (Payment Service)
   ↓ SSLCommerz Integration (500-2000ms)

5. Payment Success → Event Published (RabbitMQ)
   ↓ Async

6. Generate Ticket (Ticket Service)
   ↓ QR Code with HMAC signature (50-100ms)

7. Send SMS/Email (Notification Service)
   ↓ Non-blocking

8. Return Ticket to User ✅
```

**Total Time: ~2-3 seconds** (acceptable for booking)

---

## Slide 13: Scalability & Reliability

### Horizontal Pod Autoscaler (HPA)

**Auto-scales based on CPU/Memory:**

| Service          | Normal | Peak (Eid) |
| ---------------- | ------ | ---------- |
| API Gateway      | 3 pods | 10 pods    |
| Seat Reservation | 5 pods | 20 pods    |
| Booking Service  | 3 pods | 15 pods    |
| Search Service   | 3 pods | 15 pods    |
| Notification     | 5 pods | 15 pods    |

### Cluster Autoscaler

- Adds Kubernetes nodes when pods can't be scheduled
- Scales from 5 → 20 nodes during peak

### Database Scaling

- **PostgreSQL Read Replicas** for search queries
- **Redis Cluster** (3-5 nodes) for distributed locking
- **Connection Pooling** (max 20 connections per service)

**Result:** Handles 50,000+ concurrent users

---

## Slide 14: Security & Compliance (Condensed)

### 1. API Gateway Level

- ✅ JWT Authentication
- ✅ Rate Limiting (100 req/min per IP)
- ✅ DDoS Protection
- ✅ SSL/TLS Termination

### 2. Internal Service Security

- ✅ Service Mesh (mTLS between services)
- ✅ Network Policies (only authorized services can communicate)
- ✅ Secrets Management (Kubernetes Secrets / HashiCorp Vault)

### 3. Database Security

- ✅ Database per service (data isolation)
- ✅ Encrypted connections (SSL)
- ✅ No cross-database joins (API-based communication)

### 4. Payment Security

- ✅ SSLCommerz (PCI DSS compliant)
- ✅ Transaction verification with HMAC signatures
- ✅ No card data stored

### 5. QR Code Security

- ✅ HMAC signatures for ticket validation
- ✅ One-time use validation
- ✅ Timestamp-based expiry

---

## Slide 15: Monitoring, Observability & DevOps

Use your **DevOps/Monitoring diagrams** here and summarize:

- CI/CD pipeline (code → Jenkins → Docker → Kubernetes)
- Metrics, logs, traces (Prometheus, Loki, Jaeger, Grafana)
- High-level alert examples (error rate, latency, service down)

---

## Slide 16: Implementation Plan & Timeline

### Phase 1: Foundation (2 weeks) ✅ COMPLETED

- ✅ Nx workspace setup
- ✅ Shared libraries (11 created)
- ✅ Docker Compose (PostgreSQL, Redis, RabbitMQ)
- ✅ Database schemas (40+ tables designed)
- ✅ Kubernetes/Helm base configuration

### Phase 2: Core Services (3 weeks)

- API Gateway (Go)
- Auth Service (Login, OTP)
- User Service
- Schedule Service
- Search Service
- **Seat Reservation Service** (Critical)

### Phase 3: Booking Flow (3 weeks)

- Booking Service
- Payment Service (SSLCommerz integration)
- Ticket Service (QR codes)
- Notification Service (SMS via SSL Wireless)

### Phase 4: DevOps & Testing (2 weeks)

- CI/CD pipeline (Jenkins)
- Kubernetes deployment
- Load testing (k6 - simulate 50K users)
- Integration testing

### Phase 5: Frontend & Polish (2 weeks)

- Next.js web application
- Admin dashboard
- Mobile-responsive design
- Final testing and documentation

**Total Duration: 12 weeks**

---

## Slide 17: Current Progress (Phase 1)

### Completed (Phase 1) ✅

#### Monorepo Setup

- Nx Workspace with pnpm
- TypeScript configuration
- 11 shared libraries created

#### Infrastructure

- Docker Compose ready
- PostgreSQL (11 databases)
- Redis (caching + locks)
- RabbitMQ (messaging)

#### Database Design

- 40+ tables across 11 databases
- Complete ERD with Mermaid
- Migration strategy documented

#### Kubernetes

- 5 base manifests
- Helm chart structure
- HPA configuration

#### Documentation

- Architecture documentation (620 lines)
- Database schemas
- Infrastructure guide
- Phase 1 completion report

**Total: 60+ files, 2,500+ lines of code/docs**

**GitHub:** https://github.com/BayajidAlam/jatra

---

## Slide 18: Expected Outcomes & Impact

### Performance Metrics

| Metric               | Target      | Solution                    |
| -------------------- | ----------- | --------------------------- |
| **Concurrent Users** | 50,000+     | HPA + Load Balancer         |
| **Seat Lock Time**   | < 10ms      | Redis atomic operations     |
| **Booking Time**     | < 3 seconds | Microservices + caching     |
| **Uptime**           | 99.9%       | Auto-healing + replicas     |
| **Failed Bookings**  | < 1%        | Atomic locks + retry logic  |
| **OTP Delivery**     | < 5 seconds | RabbitMQ + async processing |

### Business Impact

- **Increased Revenue** for Bangladesh Railway
- **Better User Experience** (no crashes)
- **Scalable** for future growth
- **Modern Infrastructure** (cloud-native)
- **Open Source** potential (with permission)

---

## Slide 19: Risks & Mitigation (High-Level)

| Risk                              | Impact | Probability | Mitigation                             |
| --------------------------------- | ------ | ----------- | -------------------------------------- |
| **Redis Single Point of Failure** | High   | Medium      | Redis Cluster (3 nodes) + persistence  |
| **Database Bottleneck**           | High   | Low         | Read replicas + caching (90% hit rate) |
| **Payment Gateway Downtime**      | High   | Low         | Circuit breaker + fallback queue       |
| **High Development Complexity**   | Medium | Medium      | Nx monorepo + shared libraries         |
| **Load Testing Accuracy**         | Medium | Medium      | k6/Locust with production-like data    |
| **Cost of Infrastructure**        | Medium | Low         | Start small, scale on demand           |

---

## Slide 20: Contribution, Success Criteria & Closing

### Academic Contribution & Success Criteria (for proposal)

- **Contribution:** Practical blueprint for a scalable, Bangladesh-ready railway ticketing system using microservices, Redis atomic locking and Kubernetes.
- **Research Potential:** Future papers on Redis-based seat locking and high-traffic public service systems.
- **Success Criteria:**
  - Meets all key metrics from Slide 4
  - Implements core services and architecture
  - Demonstrates load-test results and working prototype in thesis defense

You can keep a separate **Q&A cheat sheet** (previous Slide 27) for personal use instead of including it in the slide deck.

---

## Slide 21: Thank You

# Thank You!

### Questions?

**Contact:**

- **Email:** [your-email@example.com]
- **GitHub:** https://github.com/BayajidAlam/jatra
- **LinkedIn:** [Your LinkedIn]

### Project Links

- **Repository:** https://github.com/BayajidAlam/jatra
- **Documentation:** See `/docs` folder
- **Architecture Diagrams:** See `ARCHITECTURE_VISUAL.md`

---

**"Modernizing Bangladesh Railway, One Booking at a Time"** 🚆

---
