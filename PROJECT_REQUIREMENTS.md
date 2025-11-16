# Jatra - Scalable Railway Ticketing System

## Project Requirements Document

---

## 1. Project Overview

**Problem Statement:**  
Bangladesh Railway's e-ticketing system experiences severe performance issues during peak seasons (Eid), with 30M+ hits in 30 minutes and 1,187+ concurrent attempts per seat, leading to failed bookings, OTP delivery failures, and system crashes.

**Solution:**  
A Kubernetes-based microservices architecture designed to handle extreme traffic loads with fault tolerance, horizontal scalability, and distributed tracing.

**Target Metrics:**

- Handle 50,000+ concurrent users
- Process 1,000+ attempts per seat
- Sub-second seat reservation response time
- 99.9% uptime during peak traffic
- Zero-downtime deployments

---

## 2. System Architecture

### 2.1 Microservices

| Service                  | Technology          | Responsibility                                                   |
| ------------------------ | ------------------- | ---------------------------------------------------------------- |
| API Gateway              | Go (Gin/Fiber)      | Entry point, rate limiting, routing, load balancing              |
| Auth Service             | NestJS + TypeScript | User authentication, JWT generation, OTP management              |
| User Service             | NestJS + TypeScript | User profiles, passenger details, booking history                |
| Search Service           | NestJS + TypeScript | Train search with filters, route queries                         |
| Schedule Service         | NestJS + TypeScript | Train schedules, routes, stations, coach configurations          |
| Seat Reservation Service | NestJS + TypeScript | Atomic seat locking with Redis, seat hold/release                |
| Booking Service          | NestJS + TypeScript | Booking creation, confirmation, orchestration                    |
| Payment Service          | NestJS + TypeScript | SSLCommerz integration, payment status tracking, refunds         |
| Ticket Service           | NestJS + TypeScript | Ticket generation with QR code, validation, cancellation         |
| Notification Service     | NestJS + TypeScript | SMS (via BD SMS providers) and email notifications, OTP delivery |
| Admin Service            | NestJS + TypeScript | Train management, schedule updates, seat configuration           |

### 2.2 Data Stores

| Store            | Technology    | Purpose                                               |
| ---------------- | ------------- | ----------------------------------------------------- |
| Primary Database | PostgreSQL    | Persistent data (users, bookings, schedules, tickets) |
| Cache & Locks    | Redis Cluster | Seat locks (TTL), OTPs, search cache, session storage |
| Message Queue    | RabbitMQ      | Async notifications, event-driven communication       |

### 2.3 Infrastructure

| Component               | Technology                  | Purpose                                       |
| ----------------------- | --------------------------- | --------------------------------------------- |
| Container Orchestration | Kubernetes (K8s)            | Service deployment, scaling, self-healing     |
| Container Runtime       | Docker                      | Containerization of all services              |
| Ingress Controller      | NGINX Ingress               | TLS termination, routing                      |
| Auto Scaling            | HPA + Cluster Autoscaler    | Horizontal pod and node scaling               |
| Service Mesh            | Istio or Linkerd (Optional) | Traffic management, retries, circuit breaking |

### 2.4 Observability

| Tool              | Purpose                             |
| ----------------- | ----------------------------------- |
| OpenTelemetry     | Distributed tracing instrumentation |
| Jaeger or Tempo   | Trace visualization and analysis    |
| Prometheus        | Metrics collection                  |
| Grafana           | Dashboards and alerting             |
| Loki or ELK Stack | Centralized logging                 |

### 2.5 DevOps

| Tool                   | Purpose             |
| ---------------------- | ------------------- | ------------------------------------------------ |
| Monorepo               | Nx Workspace        | Unified codebase, shared libraries, smart builds |
| CI/CD                  | Jenkins             | Automated testing and deployment pipelines       |
| Infrastructure as Code | Pulumi (TypeScript) | Cloud resource provisioning                      |
| Version Control        | Git + GitHub        | Source code management                           |
| Package Management     | Helm Charts         | Kubernetes application packaging                 |

### 2.6 Client Applications

| Application           | Technology           | Purpose                                               |
| --------------------- | -------------------- | ----------------------------------------------------- |
| Web Frontend          | Next.js + TypeScript | Main user interface for ticket booking                |
| Admin Dashboard       | Next.js + TypeScript | Train management, schedule updates, booking analytics |
| Mobile App (Optional) | React Native         | Mobile ticket booking, QR ticket display, validation  |

### 2.7 Testing & Quality

| Tool                | Purpose               |
| ------------------- | --------------------- | ---------------------------------- |
| Unit Testing        | Jest                  | Service-level unit tests           |
| Integration Testing | Supertest + Jest      | API integration tests              |
| Load Testing        | k6 or Locust          | Performance and breakpoint testing |
| E2E Testing         | Playwright (Optional) | End-to-end workflow testing        |

---

## 3. Technology Stack Summary

### Backend

- **Runtime:** Node.js (NestJS services), Go (API Gateway)
- **Framework:** NestJS (TypeScript), Gin/Fiber (Go)
- **API:** REST APIs, gRPC for inter-service communication (Optional)
- **Validation:** class-validator, class-transformer
- **Payment Gateway:** SSLCommerz (Bangladesh)
- **SMS Provider:** SSL Wireless, BulkSMS Bangladesh, or Twilio
- **QR Code:** qrcode library (Node.js)

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui or Ant Design
- **State Management:** Zustand or React Context

### Databases

- **Relational:** PostgreSQL 15+
- **Cache:** Redis 7+ (Cluster mode)
- **Message Queue:** RabbitMQ 3.12+

### DevOps & Infrastructure

- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes 1.28+
- **CI/CD:** Jenkins
- **IaC:** Pulumi (TypeScript)
- **Monitoring:** Prometheus + Grafana
- **Tracing:** OpenTelemetry + Jaeger/Tempo
- **Logging:** Loki or ELK Stack

### Development Tools

- **Monorepo:** Nx Workspace
- **Package Manager:** npm or pnpm
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

---

## 4. Implementation Phases

### Phase 1: Foundation & Core Setup

**Monorepo Setup**

- Initialize Nx workspace
- Configure TypeScript, ESLint, Prettier
- Set up shared libraries (common, types, interfaces, utils)
- Create base Docker configurations

**Database Schema Design**

- Design PostgreSQL schemas for all services
- Create entity relationship diagrams
- Set up database migration strategy (TypeORM/Prisma)
- Define Redis key patterns for caching and locking

**Infrastructure Foundation**

- Set up local development with Docker Compose
- Configure PostgreSQL, Redis, RabbitMQ containers
- Create base Kubernetes manifests
- Set up Helm chart structure

**Deliverables:**

- Nx monorepo structure
- Database schemas and ERDs
- Docker Compose for local development
- Base Kubernetes configurations

---

### Phase 2: Core Microservices Implementation

**Service Implementation**

- Implement API Gateway (Go) with routing and rate limiting
- Implement Auth Service (login, registration, JWT, SMS/Email OTP)
- Implement User Service (profile management, passenger details)
- Implement Schedule Service (train data with CRUD operations)
- Implement Search Service (train search with Redis caching)
- Implement Admin Service (train management APIs, role-based access)

**Critical Service: Seat Reservation**

- Implement atomic seat locking using Redis SET NX EX
- Add seat hold with 5-minute TTL
- Implement seat release and auto-expiry
- Add race condition prevention logic
- Optimize for 1,000+ concurrent attempts per seat

**Shared Libraries**

- Create common DTOs and interfaces
- Implement Redis utility library
- Implement PostgreSQL utility library
- Create OpenTelemetry tracing utilities
- Add shared validation schemas
- SMS service wrapper (support multiple providers)
- QR code generation utilities

**API Design**

- Define REST API contracts for all services
- Create API documentation (Swagger/OpenAPI)
- Implement request/response DTOs
- Add input validation and error handling

**Deliverables:**

- Working Auth, User, Schedule, Search, Admin services
- Atomic Seat Reservation Service with Redis
- API Gateway with routing
- Shared library packages (SMS, QR code utilities)
- API documentation

---

### Phase 3: Booking Flow & Integration

**Booking Pipeline Services**

- Implement Booking Service (orchestrates seat reservation → payment → ticket)
- Implement Payment Service (SSLCommerz integration: initiate, validate, IPN handler)
- Implement Ticket Service (ticket generation with QR code, PDF creation, validation API)
- Implement Notification Service (SMS and email OTP, booking confirmations)

**Inter-Service Communication**

- Set up RabbitMQ message queue
- Implement event-driven communication (booking events, payment events)
- Add service-to-service REST/gRPC calls
- Implement retry logic and circuit breakers

**Complete Booking Flow**

- User login/registration (email/phone)
- Train search
- Seat selection and hold (5-min TTL)
- SMS/Email OTP verification
- Payment processing via SSLCommerz
- Payment callback handling (success/fail/cancel)
- Booking confirmation
- Ticket generation with QR code
- SMS and email delivery of ticket

**Admin Dashboard Features**

- Train CRUD operations (add, edit, delete trains)
- Schedule management (update timings, routes)
- Coach and seat configuration
- Booking analytics and reports
- User management (view, block users)
- Role-based access control (admin, manager, staff)

**Unit & Integration Testing**

- Write unit tests for all services (Jest)
- Implement integration tests for critical flows
- Add API endpoint tests (Supertest)
- Test seat reservation under concurrent load
- Mock external dependencies (payment, email)

**Deliverables:**

- Complete booking flow with SSLCommerz payment
- All 11 microservices functional
- SMS and email notification system
- QR code generation and validation
- Admin dashboard for train management
- RabbitMQ event system
- Comprehensive test coverage
- End-to-end booking workflow

---

### Phase 4: DevOps, CI/CD & Kubernetes Deployment

**Kubernetes Deployment**

- Create Deployments for all services
- Configure StatefulSets (PostgreSQL, Redis, RabbitMQ)
- Set up Services and Ingress rules
- Implement ConfigMaps and Secrets management
- Configure Persistent Volumes for databases

**Auto-Scaling Configuration**

- Configure Horizontal Pod Autoscaler (HPA) for each service
- Set up Cluster Autoscaler for node scaling
- Define resource limits and requests
- Configure scaling metrics (CPU, memory, custom metrics)

**CI/CD Pipelines**

- Set up Jenkins pipelines
- Implement CI workflow (lint, test, build on PR/push)
- Implement CD workflow (deploy on main branch push)
- Add smart builds (only test/deploy changed services using Nx affected)
- Configure Docker image building and registry push
- Implement rolling deployments for zero downtime

**Helm Charts**

- Create Helm charts for all services
- Parameterize configurations for dev/staging/prod
- Set up Helm values files for different environments
- Create umbrella chart for full system deployment

**Infrastructure as Code**

- Provision cloud resources using Pulumi (TypeScript)
- Automate Kubernetes cluster setup
- Configure networking, storage, and compute resources
- Set up DNS and SSL/TLS certificates

**Deliverables:**

- Kubernetes manifests for all services
- HPA and autoscaling configurations
- Jenkins CI/CD pipelines
- Helm charts for deployment
- Pulumi IaC scripts
- Zero-downtime deployment strategy

---

### Phase 5: Observability, Load Testing & Optimization

**Distributed Tracing**

- Integrate OpenTelemetry in all services
- Configure trace propagation across services
- Set up Jaeger or Tempo for trace visualization
- Create trace dashboards for critical flows (booking, seat reservation)

**Monitoring & Alerting**

- Deploy Prometheus for metrics collection
- Create Grafana dashboards (service health, latency, throughput)
- Set up alerts for critical metrics (error rates, high latency, pod crashes)
- Monitor Redis performance (seat lock operations)
- Track RabbitMQ queue depths

**Centralized Logging**

- Deploy Loki or ELK Stack
- Configure log aggregation from all services
- Correlate logs with trace IDs
- Create log-based alerts and queries

**Load Testing**

- Create k6 or Locust load test scripts
- Test Seat Reservation Service with 1,000+ concurrent attempts per seat
- Perform breakpoint testing to find system limits
- Test complete booking flow under peak load
- Simulate 50,000+ concurrent users

**Load Test Scenarios**

- Scenario 1: 5 trains × 5 coaches × 55 seats = 1,375 seats, 50,000+ users
- Scenario 2: Peak Eid traffic simulation (30M hits in 30 minutes)
- Scenario 3: Sustained load (100k tickets/day)
- Measure: success rate, P95/P99 latency, Redis throughput, DB performance

**Performance Optimization**

- Optimize database queries (indexing, connection pooling)
- Tune Redis configuration (memory, eviction policies)
- Optimize API Gateway routing
- Implement caching strategies (schedule data, search results)
- Fine-tune Kubernetes resource allocations

**Documentation**

- System architecture diagrams
- API documentation (Swagger/OpenAPI)
- Deployment guide
- Load testing results and analysis
- Runbook for common operations

**Deliverables:**

- Distributed tracing with OpenTelemetry + Jaeger
- Prometheus + Grafana monitoring setup
- Centralized logging system
- Load testing scripts and results
- Performance benchmarks
- Complete project documentation
- Presentation slides with architecture diagrams

---

## 5. Key Technical Requirements

### 5.1 Seat Reservation Service (Critical)

**Requirements:**

- Atomic seat locking using Redis `SET key value NX EX 300`
- 5-minute TTL for seat holds
- Automatic release on expiry or manual release
- Handle 1,000+ concurrent attempts per seat without double booking
- Sub-100ms response time for seat lock operations
- Stateless design for horizontal scaling

**Redis Key Pattern:**

```
seat:{trainId}:{coachId}:{seatNumber}:{date} → userId
TTL: 300 seconds
```

### 5.2 API Gateway

**Requirements:**

- Single entry point for all client requests
- Rate limiting (per user, per IP)
- Request routing to appropriate services (user APIs + admin APIs)
- Load balancing across service instances
- TLS termination
- Request/response logging
- JWT validation with role-based routing

### 5.3 High Availability

**Requirements:**

- Minimum 2 replicas for each service
- PostgreSQL with replication (primary-replica)
- Redis Cluster mode (3+ nodes)
- RabbitMQ with clustering
- Health checks and automatic pod restarts
- Rolling updates with zero downtime

### 5.4 Security

**Requirements:**

- JWT-based authentication
- Bcrypt password hashing
- HTTPS/TLS encryption
- Secrets management with Kubernetes Secrets
- Rate limiting to prevent abuse
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)

### 5.5 Scalability

**Requirements:**

- Horizontal scaling via HPA (CPU/memory-based)
- Stateless service design
- Database connection pooling
- Redis cluster for distributed caching
- Async processing via message queue
- CDN for static assets (optional)

---

## 6. Non-Functional Requirements

**Performance:**

- API response time: < 200ms (P95)
- Seat reservation: < 100ms (P95)
- Database queries: < 50ms (P95)
- System handles 50,000+ concurrent users
- System processes 1,000+ requests per second

**Reliability:**

- 99.9% uptime
- Automatic service recovery
- Circuit breakers for external dependencies
- Retry logic with exponential backoff
- Data consistency across services

**Scalability:**

- Auto-scale from 2 to 50+ pods per service
- Support 100,000+ registered users
- Handle 10M+ bookings per month
- Scale database with read replicas

**Maintainability:**

- Comprehensive unit and integration tests
- Clear code documentation
- Consistent coding standards (ESLint, Prettier)
- Automated CI/CD pipelines
- Infrastructure as Code

**Observability:**

- Distributed tracing across all services
- Real-time metrics and dashboards
- Centralized logging with search
- Alerting for critical issues
- Performance profiling capabilities

---

## 7. Out of Scope

- Counter ticket sales system
- Train delay notifications and real-time tracking
- Multi-language support (Bengali + English)
- Dynamic pricing algorithms
- User reviews and ratings
- Social media integration
- Advanced analytics and ML-based predictions
- Customer support chat system
- Loyalty programs and discounts
- Integration with other transportation systems

---

## 8. Success Criteria

**Technical Success:**

- All 11 microservices deployed and functional
- System handles 50,000+ concurrent users in load tests
- Seat Reservation Service prevents double booking under load
- SSLCommerz payment integration working (sandbox environment)
- SMS and email notifications delivered successfully
- QR code generation and validation functional
- Admin dashboard manages train data effectively
- Zero-downtime deployment demonstrated
- Distributed tracing visualizes complete booking flow
- CI/CD pipeline automatically tests and deploys only changed services

**Functional Success:**

- Complete booking flow: search → select → hold → SMS/Email OTP → SSLCommerz payment → ticket with QR
- Users receive SMS and email notifications at each step
- Tickets with QR codes can be downloaded and validated
- Payment success/failure handled via SSLCommerz callbacks
- Admin can add/edit/delete trains and schedules
- QR code validation works for ticket verification
- System gracefully handles failures (payment timeout, OTP expiry, seat expiry)

**Documentation Success:**

- Architecture diagrams clearly explain system design
- API documentation covers all endpoints
- Load testing results demonstrate performance
- Deployment guide enables reproduction
- Presentation effectively communicates solution

---

## 9. Deliverables Summary

- Single GitHub repository (monorepo with Nx)
- 11 microservices (NestJS + Go)
- Web frontend (Next.js) - User booking interface
- Admin dashboard (Next.js) - Train management interface
- SSLCommerz payment integration
- SMS notification integration (BD SMS provider)
- QR code generation and validation system
- PostgreSQL + Redis + RabbitMQ integration
- Kubernetes manifests and Helm charts
- Jenkins CI/CD pipelines
- Pulumi IaC scripts
- OpenTelemetry + Jaeger tracing
- Prometheus + Grafana monitoring
- Load testing scripts (k6/Locust)
- Docker Compose for local development
- Complete documentation
- Architecture and DevOps diagrams
- Presentation slides
- Load testing results and analysis

---

**End of Requirements Document**
