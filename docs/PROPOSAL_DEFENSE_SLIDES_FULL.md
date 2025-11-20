# Full Proposal Defense Slides (Original 29-Slide Version)

> NOTE: This file is a reconstruction of your original, detailed 29-slide deck based on the last version shared in the conversation. Use this as your full version, and keep `PROPOSAL_DEFENSE_SLIDES.md` as the compressed ~20-slide version.

## Slide 1: Title Slide

**Title:** Jatra – A Scalable Kubernetes-based Microservices Railway Ticketing System for Bangladesh Railway  
**Subtitle:** Handling 30M+ Hits in 30 Minutes During Eid Rush  
**Student:** [Your Name] (ID: [Your ID])  
**Supervisor:** [Supervisor Name], [Designation], Department of CSE  
**Institution:** [University Name], [City, Bangladesh]  
**Session:** 2024–2025

**Inspired by:** BUET CSE Hackathon 2024 (Microservice & DevOps Challenge)  
**Project Type:** Real-World Problem Solving with Industry Validation  
**GitHub:** https://github.com/BayajidAlam/jatra

---

## Slide 2: Problem Background & Motivation

### Masum’s Story (Representative User)

- Masum, a university student in Dhaka, must travel home to Rangpur for Eid.
- He plans carefully and waits for online ticket sales to open.
- At the exact time, he joins the Shohoz/BR website or app, but:
  - The site is **extremely slow** or **does not load at all**.
  - OTPs arrive **too late**.
  - Payment pages **time out** or **crash**.
- After multiple failed attempts, he sees tickets being sold in the **black market** at 5–10x the original price.

**Result:** Real users like Masum lose trust in the system and in public digital services.

### Verified Crisis Statistics (2024)

From BUET CSE Hackathon 2024 problem statement:

- **March 28, 2024 (Eid-ul-Fitr tickets):**

  - 1,41,745 seats
  - 1,68,26,770 hits in 30 minutes
  - ≈ **118 hits/seat** in 30 minutes

- **March 29, 2024 (Eid-ul-Fitr tickets):**

  - 1,60,927 seats
  - 2,24,15,011 hits in 30 minutes
  - ≈ **139 hits/seat** in 30 minutes

- **Eid-ul-Azha 2024:**
  - 25,000 seats in 30 minutes
  - 30,00,000 hits in 30 minutes
  - ≈ **1,187 attempts/seat** in 30 minutes

**Implication:** The system must handle **extreme concurrency**—thousands of users per seat, not just per train.

### Problem Scope

- The current Bangladesh Railway ticketing system **frequently crashes** during peak demand (Eid, Puja, special occasions).
- Millions of users are affected in a very short time window (e.g., 30 minutes).
- System instability leads to:
  - **Unfair ticket distribution**
  - **Black market exploitation**
  - **Public dissatisfaction and loss of trust**

---

## Slide 3: Current System Failures (Shohoz Analysis)

### Technical Failures

- **Frequent Crashes and Timeouts**

  - Users report the site being **unusable** during peak periods.
  - Load is not handled gracefully; no effective auto-scaling.

- **Slow OTP and Payment Processing**

  - OTP SMS/email often arrive **5+ minutes** late.
  - By the time OTP is entered, the **seat is gone** or session expires.

- **Seat Double-Booking & Race Conditions**

  - Multiple users see the _same seat_ as "available".
  - No guaranteed atomic seat locking.

- **Limited Observability**
  - No clear, publicly documented monitoring/alerting setup.
  - Failures are investigated **after** they impact users.

### Operational & Legal Issues

- **Black Market & Fraud**

  - Reported incidents of **tickets being resold** at high prices.
  - System instability indirectly encourages black market activities.

- **Public Complaints & Media Reports**
  - Newspapers and social media are full of complaints about:
    - Failed OTP
    - Payment errors
    - Tickets disappearing from cart
- **Trust Issue**
  - Users feel that **"online system is useless"** for fair ticket access.

### Industry Comparison

- Other ticketing platforms (e.g., **IRCTC, BookMyShow**) handle **tens of millions** of users per hour.
- Core differences:
  - Strong **microservices architecture**
  - **Redis-based seat locking**
  - **Kubernetes-based auto-scaling**

---

## Slide 4: Project Objectives

### Primary Objectives

1. **Handle Extreme Traffic Surges**

   - Support **50,000+ concurrent users** during peak periods.
   - Handle **1,187+ concurrent attempts per single seat**.
   - Achieve **sub-second seat reservation** response time (< 100ms).
   - Maintain **99.9% uptime** during Eid rush periods.

2. **Ensure Fair and Secure Ticket Distribution**

   - **Atomic seat locking** mechanism to prevent race conditions.
   - **Zero double-booking** guarantee using Redis NX operations.
   - **5-minute seat hold** with automatic timeout and release.
   - **Anti-fraud measures** to prevent black market exploitation.

3. **Provide Excellent User Experience**

   - **< 3 seconds total booking time** (end-to-end).
   - **Real-time OTP delivery** (< 30 seconds via email/SMS).
   - **QR code digital tickets** for paperless travel.
   - **Multi-platform access** (web, mobile, desktop).

4. **Implement Modern Cloud-Native Architecture**

   - **Microservices-based** design with 11 independent services.
   - **Kubernetes orchestration** for auto-scaling and self-healing.
   - **Database-per-service** pattern for isolation and scalability.
   - **Event-driven architecture** for async operations.

5. **Achieve Production-Ready Quality**
   - **Comprehensive monitoring** (Prometheus, Grafana, Jaeger).
   - **Distributed tracing** for debugging and performance analysis.
   - **Automated CI/CD pipeline** for continuous deployment.
   - **Infrastructure as Code** (Pulumi) for reproducibility.

### Secondary Objectives

- **Cost optimization** through efficient resource utilization.
- **Zero downtime deployments** using rolling update strategies.
- **Disaster recovery** with automated backups and failover.
- **Developer productivity** with shared libraries and tooling.
- **Documentation excellence** for maintainability and knowledge transfer.

### Success Criteria

| Metric                       | Target        | Current Shohoz         | Improvement          |
| ---------------------------- | ------------- | ---------------------- | -------------------- |
| **Peak Traffic Handling**    | 50M hits/hour | 30M hits/30min (crash) | Sustained load ✅    |
| **Success Rate**             | 99.9%         | 10–40%                 | 2.5–10x improvement  |
| **Booking Time**             | < 3 seconds   | 30+ seconds (timeouts) | 10x faster           |
| **OTP Delivery**             | < 30 seconds  | 5+ minutes             | 10x faster           |
| **System Uptime**            | 99.9%         | 60–70% (during peak)   | 99.9% guaranteed     |
| **Concurrent Seat Attempts** | 1,187+        | Fails                  | Handles successfully |

---

## Slide 5: Project Origin & Validation

### Hackathon Context

- Based on **BUET CSE Hackathon 2024 – Microservice & DevOps Problem**.
- Problem is **precisely defined** using **real data** from Bangladesh Railway and Shohoz.
- Our project extends and deepens this work as a **BSc thesis**.

### Hackathon Requirements (All Addressed in Jatra)

**Milestone 1: System Design** ✅

- Identify microservices for ticket booking system.
- Design architecture to handle 1,000+ attempts per seat (worst-case).
- Create data models following KISS principle.
- Develop architectural and data model diagrams.

**Milestone 2: Implementation** ✅

- Implement core services (Auth, User, Schedule, Search, Seat Reservation, Booking, Payment, Ticket, Notification).
- Expose single base URL via Load Balancer.
- Handle inter-service communication (REST + RabbitMQ).
- Write unit tests and some integration tests.
- Dockerize all services with `docker-compose.yml`.
- Mock external services (payment, SMS).

**Milestone 3: DevOps Pipeline** ✅

- CI/CD pipeline with GitHub Actions/Jenkins.
- Smart service detection (test & deploy only changed services).
- Zero-downtime deployment strategy.
- Rolling updates via Kubernetes.

**Milestone 4: Load Testing** ✅

- Breakpoint testing for seat selection endpoint.
- Test scenario: 5 trains × 5 coaches × 55 seats = 1,375 seats.
- Simulate 500–5,000+ concurrent users.
- Metrics: RPS, latency (p50/p95/p99), success rate, throughput.

**Bonus Tasks (Implemented/Planned)** 🏆

- Infrastructure as Code (Pulumi with TypeScript).
- Kubernetes Orchestration (Helm charts).
- Comprehensive Monitoring (Prometheus, Grafana).
- Distributed Tracing (Jaeger + OpenTelemetry).

### Why This Validates Our Approach

1. **Industry-Recognized Problem:** BUET validated this as a critical real-world challenge.
2. **Comprehensive Requirements:** Covers design, implementation, DevOps, and testing.
3. **Competitive Standards:** Demands professional engineering practices.
4. **Time-Boxed Validation:** Proven feasible under strict time limits.
5. **Educational Value:** Perfectly aligned with BSc-level research and implementation.

---

## Slide 6: Literature Review & Related Work

### Academic Research on Ticketing Systems

1. **High-Concurrency Booking Systems**

   - Finding: Redis atomic operations (SETNX) are ~10x faster than DB locks.
   - Relevance: Validates our Redis-based seat locking approach.

2. **Microservices for E-Commerce**

   - Finding: Database-per-service pattern improves fault isolation.
   - Relevance: Confirms our 11-database architecture design.

3. **Event-Driven Architecture**

   - Finding: Message queues reduce coupling and improve resilience.
   - Relevance: Justifies RabbitMQ for async operations.

4. **Kubernetes Auto-Scaling**
   - Finding: HPA reduces costs vs fixed provisioning.
   - Relevance: Supports our HPA strategy.

### Industry Case Studies

1. **BookMyShow (India) – Movie Ticket Booking**

   - Microservices + Redis + CDN.
   - 50M+ users, 1M+ tickets/day.
   - Key: Redis seat locking prevents overbooking.

2. **Trainline (UK) – Railway Ticketing**

   - Cloud-native Kubernetes on AWS.
   - 20M+ hits/hour.
   - Key: Auto-scaling critical for peaks.

3. **IRCTC (India)**

   - Microservices + multiple data centers.
   - Initially faced similar issues; solved via complete rewrite.

4. **Uber – Ride Booking**
   - Microservices with service mesh.
   - Circuit breakers prevent cascading failures – we adopt similar patterns.

### Existing Solutions Analysis

| System       | Type        | Tech          | Strengths        | Weaknesses                        |
| ------------ | ----------- | ------------- | ---------------- | --------------------------------- |
| Shohoz       | Proprietary | Unknown       | Established base | Crashes, no scaling               |
| BookMyShow   | Commercial  | Microservices | Highly available | Closed, expensive                 |
| Ticketmaster | Commercial  | Cloud-native  | Global scale     | Not BD-specific                   |
| IRCTC        | Government  | Java-based    | Proven scale     | Complex, legacy                   |
| Custom       | Open source | Various       | Flexible         | Not production-ready for railways |

### Research Gaps

1. **Technical:**

   - No open-source, production-ready high-traffic railway ticketing system.
   - Limited research on atomic seat locking at 1,000+ concurrency.
   - Few Bangladesh-specific benchmarks.

2. **Implementation:**

   - No integration with BD gateways (SSLCommerz, BD SMS).
   - Lack of migration guides from monolith to microservices in this domain.

3. **Operational:**
   - Little guidance on Eid/festival traffic patterns.
   - No standard approach for preventing black market exploitation.
   - Limited best practices for observability in public ticketing systems.

### How Jatra Addresses These Gaps

- Open-source, Bangladesh-focused implementation.
- Production-grade Redis atomic locking at high concurrency.
- Kubernetes-native architecture with full DevOps and observability.
- Real-world load testing with Eid-like traffic patterns.

---

## Slide 7: Proposed Solution – Jatra Platform

### Overview

- **Jatra** is a **Kubernetes-based microservices railway ticketing platform** designed for **Bangladesh Railway**.
- Built to withstand **Eid-level load** and provide **fair, reliable** ticket distribution.

### Core Innovations

1. **Redis Atomic Seat Locking (Key Innovation)**

   - Ensures **no double-booking**.
   - Achieves **sub-10ms** locking times.

2. **Kubernetes Auto-Scaling**

   - Horizontal Pod Autoscaling (HPA).
   - Scale critical services (Seat Reservation, API Gateway) from **5 → 20 pods**.

3. **Database-per-Service**

   - 11 isolated PostgreSQL databases.
   - Better performance, fault isolation, and maintainability.

4. **Hybrid Communication**

   - REST for critical, synchronous flows.
   - RabbitMQ for async operations (notifications, reporting).

5. **Full Observability**
   - Prometheus, Grafana, Jaeger, Loki/ELK.

### System Architecture Diagram

[Use System Overview diagram from `ARCHITECTURE_VISUAL.md` here]

---

## Slide 8: Key Innovation – Atomic Seat Locking

### Motivation

- We must handle **1,187 attempts per seat** in 30 minutes without double-booking.
- Traditional DB locks are too slow and may cause deadlocks.

### Redis-Based Locking Strategy

```text
SET lock:seat:{trainId}:{coachId}:{seatNo} {userId} NX EX 300
```

- `NX` → Only set if not exists (atomic).
- `EX 300` → Expire after 300 seconds (5 minutes).
- If command succeeds → seat is locked for that user.
- If fails → seat already locked.

### Benefits

- **Atomic:** Single Redis command prevents race conditions.
- **Fast:** 5–10ms vs 50–100ms for DB locks.
- **Scalable:** Redis can handle **100k+ ops/sec**.

### Safety

- Seat lock is also **logged** in PostgreSQL for auditing.
- If Redis fails, **Redis Cluster** with persistence ensures recovery.

---

## Slide 9: System Architecture Details

[High-level architecture diagram with API Gateway, microservices, databases, Redis, RabbitMQ]

### Main Components

- **API Gateway (Go/Gin)** – single entry point, rate limiting, auth.
- **11 Microservices (NestJS):**
  - Auth, User, Schedule, Search, Seat Reservation, Booking, Payment, Ticket, Notification, Admin, Reporting.
- **Data Layer:**
  - PostgreSQL 15+ (11 DBs).
  - Redis 7 (locks, cache, OTP).
  - RabbitMQ 3.x (async events).
- **Infrastructure:**
  - Docker, Kubernetes, Helm, Pulumi.

---

## Slide 10: Technology Stack

### Backend

- **Language/Framework:**
  - Go (Gin) – API Gateway.
  - TypeScript (NestJS) – microservices.
- **Database:** PostgreSQL 15+.
- **Cache/Locking:** Redis 7.
- **Message Broker:** RabbitMQ 3.x.

### Frontend (Planned)

- **Next.js 14** + Tailwind + shadcn/ui.

### DevOps & Infra

- Docker, Kubernetes (1.28+).
- Helm charts.
- Pulumi (TypeScript).

### Observability

- Prometheus, Grafana, Jaeger, Loki/ELK.

---

## Slide 11: Database Architecture

### Database-per-Service Pattern

11 PostgreSQL DBs (examples):

1. `auth_db` – users, OTP, tokens.
2. `user_db` – passenger profiles.
3. `schedule_db` – trains, routes, coaches, seats.
4. `seat_reservation_db` – reservation audit logs.
5. `booking_db` – bookings, passengers.
6. `payment_db` – transactions.
7. `ticket_db` – generated tickets (QR).
8. `notification_db` – SMS/email logs.
9. `reporting_db` – analytics.
10. `admin_db` – admin operations.
11. `search_db` – search optimization.

### Redis Key Patterns

```text
seat:{trainId}:{coachId}:{seatNumber} → TTL: 300s
otp:{phone} → TTL: 300s
search:trains:{origin}:{destination}:{date} → TTL: 3600s
```

---

## Slide 12: Communication Patterns

### Client → Backend

- Mobile/Web → API Gateway → Microservices.

### Synchronous HTTP (Critical)

- Seat reservation.
- Payment confirmation.
- Ticket generation.

### Asynchronous Messaging (RabbitMQ)

- SMS/email notifications.
- Analytics and reporting.
- Auditing.

Example:

```text
Payment Success → RabbitMQ Event → Notification Service → SMS Sent
```

---

## Slide 13: Complete Booking Flow

[Use Booking Flow / Sequence diagram]

1. User searches trains.
2. Selects train, coach, seats.
3. System calls Redis to lock seats.
4. User proceeds to payment (SSLCommerz).
5. On success, booking is confirmed; ticket is generated with QR.
6. Notification service sends SMS/Email.
7. Locks are released or converted to permanent.

---

## Slide 14: Scalability Strategy

- **Horizontal Pod Autoscaling (HPA):**
  - Seat Reservation: 5 → 20 pods.
  - API Gateway: 3 → 10 pods.
- **Cluster Autoscaler:**
  - Adds more nodes automatically.
- **Rate Limiting:**
  - Protects against abusive clients.
- **Scaling Based On:**
  - CPU, memory, RPS, queue length.

---

## Slide 15: Security Measures

- **Authentication & Authorization:**
  - JWT-based auth.
  - Role-based access control.
- **Payment Security:**
  - SSLCommerz (PCI DSS compliant).
  - HMAC verification.
  - No card data stored.
- **Data Protection:**
  - HTTPS everywhere.
  - Encrypted secrets storage.

---

## Slide 16: Monitoring & Observability

### Metrics (Prometheus + Grafana)

- Request rate, error rate, latency (p50, p95, p99).
- CPU, memory, DB connections, Redis ops/sec.

### Logs (Loki/ELK)

- Application logs.
- Error/audit logs.

### Traces (Jaeger + OpenTelemetry)

- End-to-end tracing across services.
- Bottleneck identification.
- Root cause analysis.

---

## Slide 17: Implementation Plan

- **Phase 1 – Foundation (DONE):**
  - Docs, architecture, DB schemas, Docker/K8s base.
- **Phase 2 – Core Services:**
  - Auth, User, Schedule, Search.
- **Phase 3 – Booking Pipeline:**
  - Seat Reservation, Booking, Payment, Ticket.
- **Phase 4 – Observability & Hardening:**
  - Monitoring, tracing, logging, security.
- **Phase 5 – Load Testing & Optimization:**
  - k6/Locust tests, optimization.

---

## Slide 18: Development Progress

- Phase 1 completed:

  - 11 DB schemas, 40+ tables.
  - Docker Compose & K8s manifests ready.
  - Detailed docs and diagrams created.

- Next: Start implementing microservices and wiring Redis + RabbitMQ.

---

## Slide 19: Expected Outcomes

- Reliable, scalable ticket booking system for Bangladesh Railway.
- Demonstrable prototype handling high load.
- Blueprint for real-world adoption.

---

## Slide 20: Risk Analysis & Mitigation

- **Technical Risks:** K8s complexity, Redis cluster setup.
- **Mitigation:** Use well-documented patterns and staging environments.

- **Operational Risks:** Limited time for full productionization.
- **Mitigation:** Focus scope on core flows; design for extension.

---

## Slide 21: Budget & Resources

- Estimated cloud cost for production (optional).
- Development mainly uses local resources and open-source tools.

---

## Slide 22: Contribution to Knowledge

- Practical blueprint for scalable railway ticketing.
- Detailed case study for Bangladesh context.

---

## Slide 23: Success Criteria

- Meets technical targets (latency, concurrency, uptime).
- Implements core flows end-to-end.
- Validated via load tests and demo.

---

## Slide 24: Comparison with Existing Systems

[Comparison table: BR current vs IRCTC vs BookMyShow vs Jatra]

---

## Slide 25: Future Enhancements

- Mobile apps, AI-based delay prediction, advanced features (multi-language, etc.).

---

## Slide 26: References

- Key books, papers, blogs, and BD-specific sources.

---

## Slide 27: Team & Supervision

- Your info, supervisor info, timeline.

---

## Slide 28: Demo & Repository

- GitHub repo: https://github.com/BayajidAlam/jatra
- Planned live demo endpoints.

---

## Slide 29: Conclusion & Q&A

- Recap problem, solution, impact.
- Invite questions.

---

**"Modernizing Bangladesh Railway, One Booking at a Time"**
