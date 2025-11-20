# Jatra – Project Phases Overview

This document summarizes all major phases of the **Jatra** project so you (and your supervisor) can quickly see what is planned and what is completed.

> You can update the checkboxes as you progress.

---

## Phase 0 – Problem Analysis & Requirements

- [x] Study Bangladesh Railway online ticketing failures (Shohoz case).
- [x] Collect verified traffic statistics from BUET CSE Hackathon 2024.
- [x] Define core problem: 30M+ hits/30 mins, 1,187 attempts/seat, crashes, unfair distribution.
- [x] Identify stakeholders and user story (e.g., Masum).
- [x] Decide high-level goals and success metrics.

---

## Phase 1 – Foundation (Architecture, DB, Infra)

_Status: **Completed** (as of Phase 1 completion document)_

- [x] Design overall system architecture (microservices, Redis, RabbitMQ, K8s).
- [x] Design database schemas for 11 services (40+ tables).
- [x] Create ERD / schema diagrams.
- [x] Set up Docker Compose for local development.
- [x] Prepare base Kubernetes manifests / Helm charts.
- [x] Write core documentation (problem statement, Shohoz analysis, hackathon context).
- [x] Create architecture diagrams in `ARCHITECTURE_VISUAL.md`.

Reference: `docs/PHASE1_COMPLETION.md`, `docs/PROPOSAL_DEFENSE_SLIDES.md`, `docs/SHOHOZ_ANALYSIS.md`.

---

## Phase 2 – Core Microservices

_Status: **Planned**_

- [ ] Implement core backend services:
  - [ ] Auth Service
  - [ ] User Service
  - [ ] Schedule Service
  - [ ] Search Service
- [ ] Connect each service to its own PostgreSQL database.
- [ ] Expose REST APIs for core operations (login, profile, schedule, search).
- [ ] Add basic unit tests for each service.
- [ ] Wire services into API Gateway.

---

## Phase 3 – Booking & Payment Pipeline

_Status: **Planned**_

- [ ] Implement critical booking services:
  - [ ] Seat Reservation Service (with Redis atomic locks)
  - [ ] Booking Service
  - [ ] Payment Service (SSLCommerz integration / mock)
  - [ ] Ticket Service (QR code generation)
  - [ ] Notification Service (SMS/Email via queue)
- [ ] Integrate Redis for seat locking and OTP.
- [ ] Ensure end-to-end booking flow: search → seat selection → payment → ticket → notification.
- [ ] Add integration tests for booking pipeline.

---

## Phase 4 – Observability, Security & Hardening

_Status: **Planned**_

- [ ] Set up monitoring stack:
  - [ ] Prometheus metrics
  - [ ] Grafana dashboards
  - [ ] Loki/ELK for logs
  - [ ] Jaeger + OpenTelemetry for traces
- [ ] Add alert rules (error rate, latency, service down, etc.).
- [ ] Harden security:
  - [ ] JWT-based auth & RBAC
  - [ ] Secrets management for DB, Redis, SSLCommerz
  - [ ] TLS/HTTPS configuration (where applicable)
- [ ] Improve test coverage and error handling.

---

## Phase 5 – Load Testing & Optimization

_Status: **Planned**_

- [ ] Design load testing scenarios based on BUET/Hackathon stats:
  - [ ] 25,000 seats, 30M hits/30 minutes
  - [ ] 1,187 attempts per seat
- [ ] Implement tests using k6/Locust (or similar).
- [ ] Measure key metrics: RPS, p50/p95/p99 latency, success rate, error rate.
- [ ] Tune HPA, Redis, PostgreSQL (indexes, connection limits).
- [ ] Document results and compare against success criteria.

---

## Phase 6 – Future Enhancements (Post-FYP)

_Status: **Ideas / Future Work**_

- [ ] Mobile apps (React Native/Flutter) for Android/iOS.
- [ ] AI/ML-based features:
  - [ ] Train delay prediction
  - [ ] Seat recommendation
- [ ] Advanced user features:
  - [ ] Multi-language interface (Bangla, English)
  - [ ] Group bookings and special assistance bookings
- [ ] Multi-region deployment for lower latency and higher resilience.

---

## Quick Reference

- **High-level goal:** Build a Kubernetes-native microservices ticketing system for Bangladesh Railway that can survive Eid-level load fairly and reliably.
- **Key innovation:** Redis atomic seat locking for 1,187+ attempts/seat with no double-booking.
- **Primary docs:**
  - `docs/HACKATHON_PROBLEM_STATEMENT.md`
  - `docs/SHOHOZ_ANALYSIS.md`
  - `docs/ARCHITECTURE_VISUAL.md`
  - `docs/PHASE1_COMPLETION.md`
  - `docs/PROPOSAL_DEFENSE_SLIDES.md` and `docs/PROPOSAL_DEFENSE_SLIDES_FULL.md`

You can update this file as tasks are completed so both you and I can refer to the same phase overview in future discussions.
