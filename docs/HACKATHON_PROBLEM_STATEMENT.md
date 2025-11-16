# BUET CSE Hackathon 2024 - Problem Statement

## Event Details
- **Date**: 24th October, 2024
- **Location**: Department of Computer Science and Engineering, BUET
- **Theme**: Microservice and DevOps
- **Duration**: 24 hours

---

## 🧩 Problem Background

### The Story: Masum's Failed Booking Experience

Masum, a software engineer II at Pridesys IT, is excited for Eid because he's heading home to Chittagong. With a week-long vacation ahead, he plans to take the train, one of his favorite ways to travel home. Knowing the rush for Eid tickets, he's ready to book his seat as soon as Bangladesh Railway opens online booking at 2 PM.

Masum logs onto the Bangladesh Railway ticketing website (https://eticket.railway.gov.bd/) ahead of the 2 PM release, aware that thousands of people will be trying to get their tickets simultaneously.

#### Normal Day Booking Flow:
1. Login to the system
2. Search for available trains
3. Select a seat
4. Confirm purchase with OTP verification
5. Fill out passenger details
6. Complete payment through mobile banking or debit/credit card
7. Receive confirmation email
8. Download ticket
9. Option to verify or cancel ticket later

**Note**: Tickets can be bought online ten days in advance.

#### Eid Rush Day Reality:
Today, however, things are different. Masum logs in early, and when the tickets go live, he manages to select his seat on the first attempt—he's quick! Now, he needs the OTP to proceed to the payment step. 

- **1 minute passes** - No OTP
- **2 minutes pass** - Still waiting
- **5 minutes pass** - Timer ticking, still no OTP

Frustrated, he tries again, but each attempt to secure a ticket fails. Sometimes the website freezes. After multiple retries and no luck, Masum gives up, feeling defeated. His dreams of going back home this year are shattered.

Exhausted and frustrated, Masum posts his experience on Facebook, and to his surprise, **he's not alone**. Many of his friends report the same issues:
- No OTP delivery
- Failed transactions
- Website freezing
- Booking timeouts

What should have been a simple, user-friendly process turned into a frustrating experience.

---

## 🔥 Real-World Traffic Statistics

### Verified Traffic Data (2024)

| Date | Total Hits | Time Window | Avg Attempts per Seat | Tickets Available | Source |
|------|-----------|-------------|----------------------|-------------------|---------|
| **March 28, 2024** (Day 5) | 16.8 million | 30 minutes | 600+ | ~28,000 | Prothom Alo |
| **March 29, 2024** (Day 6) | 22.4 million | 30 minutes | 500+ | 32,587 | Dhaka Tribune |
| **Eid-ul-Azha 2024** | ~30 million | 30 minutes | **1,187+** | ~25,000 | Dhaka Tribune |

### Breakdown by Zone (March 29, 2024):
- **8:00 AM (Western Zone)**: 12.8 million hits in first 30 minutes
- **2:00 PM (Eastern Zone)**: 9.6 million hits in first 30 minutes

### Daily Operations:
- **Daily Ticket Issuance**: 80,000 – 100,000 tickets
- **Total Tickets (4 months)**: 10 million tickets
- **Registered Users**: 1.4 million users
- **Stations Covered**: 77 stations nationwide

---

## 🎯 Your Mission

**As a developer, design and develop a scalable and robust system that can handle extreme traffic and ensure a smooth flow towards buying train tickets online.**

### Core Challenge:
Handle **30M+ hits in 30 minutes** with **1,187+ concurrent attempts per single seat** while maintaining:
- System availability
- Data consistency
- Fair ticket allocation
- Smooth user experience
- Zero revenue loss

---

## 🏁 Milestones

### ✅ Milestone 1: System Design

**Objectives:**
- Identify various services involved in the ticket booking system
- Design robust and scalable architecture
- Handle 1,000+ attempts per seat in worst-case scenario
- Create architectural diagram
- Design data models for each service
- Design APIs (KEEP IT STUPID SIMPLE)

**Key Requirements:**
- Architecture is the backbone - must be resilient
- Data models must be normalized and efficient
- API design must be RESTful and minimal
- Pre-populate database with train information:
  - Train name, route, schedule
  - Number of seats, seat fare
  - Coach information, station details

**Note**: Admin dashboard is **NOT required**. Just pre-populate the database.

---

### ✅ Milestone 2: Implementation

**Core Services to Implement:**
1. **Authentication Service**: Login/Registration, JWT, OTP
2. **Train Service**: Train schedules, routes, fares
3. **Seat Reservation Service**: Atomic seat holds (critical!)
4. **Booking Service**: Final booking commits
5. **Payment Service**: Mock payment gateway (no real integration)
6. **Notification Service**: Email OTP (SMS optional/mock)

**Technical Requirements:**
- Expose **only ONE base URL** to frontend → Use Load Balancer
- Handle inter-service communication (REST/gRPC/Message Queue)
- Write **unit tests** for each service (mandatory)
- Write **integration tests** (optional, bonus marks)
- Services must be **independently scalable**
- Dockerize all services
- Provide working **docker-compose.yml** with no external dependencies

**Frontend:**
- Minimalistic frontend to demonstrate the system
- Focus on core logic, not UI aesthetics
- Optional: Compete for "Best UI" segment separately

**Mock Services:**
- Payment Gateway: Mock the payment flow (no SSLCommerz/bKash integration)
- SMS Service: Mock OTP delivery (email OTP is fine)

---

### ✅ Milestone 3: DevOps Pipeline

**Cloud Deployment:**
- Provision cloud resources on platform of choice (AWS/GCP/Azure/DigitalOcean)

**CI/CD Pipeline (GitHub Actions or similar):**

#### CI Workflows (Continuous Integration):
- Trigger on: Pull Request OR Push to any branch
- Run only on changed services (smart detection)
- Execute unit tests for affected services
- Code quality checks (linting, formatting)
- Build Docker images
- **Block merge** if tests fail

#### CD Workflows (Continuous Deployment):
- Trigger on: Push to default branch only
- Deploy only the services that changed
- Zero-downtime deployment strategy
- Health checks before routing traffic
- Rollback mechanism in case of failure

**DevOps Diagram Required:**
- Create a visual representation of your CI/CD pipeline
- Show branching strategy
- Deployment flow
- Rollback mechanism

**Key Principle**: 
> "Your services should remain accessible during continuous deployment"

---

### ✅ Milestone 4: Load Testing

**Objective**: Verify if your system can handle the mentioned load (30M hits, 1,187+ attempts per seat)

**Mandatory Testing:**
- **Breakpoint-testing** for **seat selection endpoints only** (required)

**Bonus Testing:**
- Load testing on other critical endpoints:
  - Login/Authentication
  - Train search
  - Booking confirmation
  - Payment processing

**Example Test Scenario:**
```
Number of trains: 5
Number of coaches per train: 5
Number of seats per coach: 55
Total seats: 5 × 5 × 55 = 1,375 seats
Number of concurrent users: Variable (500 → 5,000+)
```

**Feel free to create your own scenario** (bonus marks for creativity!)

**Load Testing Tools**: k6, JMeter, Locust, Gatling, Artillery

**Metrics to Capture:**
- Requests per second (RPS)
- Response time (p50, p95, p99)
- Success rate vs failure rate
- Throughput
- Error rate
- System resource usage (CPU, Memory, Network)

**Judgment Criteria:**
> "Don't worry if your system can't handle millions of requests per minute—the judgment will be based on how many requests your system can successfully manage."

---

## 🎁 Bonus Tasks (Optional)

### 1. Infrastructure as Code (IaC)
- Use Terraform, Pulumi, CloudFormation, or Ansible
- Provision entire infrastructure declaratively
- Version control your infrastructure

### 2. Orchestration
- Deploy on Kubernetes
- Use Helm charts for repeatable deployments
- Implement autoscaling (HPA, VPA, Cluster Autoscaler)
- Service mesh (Istio/Linkerd) for traffic management

### 3. Monitoring & Observability
- Metrics: Prometheus + Grafana
- Distributed Tracing: Jaeger, Zipkin, or Tempo
- Logging: ELK Stack or Loki
- APM: New Relic, Datadog, or OpenTelemetry

### 4. Zero Downtime During Counter Ticket Sales
- Tickets can be purchased online 10 days in advance
- System should remain accessible to:
  - Users viewing available tickets
  - Counter ticket bookings for other trips
  - Users checking booking history
- No maintenance windows during peak hours

### 5. Extra Load Testing & Custom Scenarios
- Create realistic traffic patterns (burst, gradual ramp-up, sustained load)
- Simulate different user behaviors
- Test edge cases (retry storms, timeout cascades)

---

## 📦 Deliverables

### 1. Presentation Slide
- Must be completed within 24-hour hackathon time
- Explain architecture, design decisions, and results
- Include system diagrams, load testing results

### 2. Single GitHub Repository
- All microservices in one repo
- CI/CD workflows (.github/workflows/)
- docker-compose.yml
- README.md with setup instructions
- Load testing scripts and results
- Documentation (architecture, API docs)

**⚠️ Important**: You **cannot push anything** to your default branch after the hackathon ends!

---

## 📌 General Instructions

### Repository Rules:
1. **Start a new GitHub repository onsite** and submit at the end
2. **Project must be developed on the day of the Hackathon**
3. Any project developed (even partially) in advance will **not be accepted**
4. If using publicly available code, **properly attribute the source**

### Tech Stack:
- Unless otherwise specified, **participants can choose their own tech stack**
- Use what you're comfortable with and can deliver fast

### Scope Management:
> **"This is too much work for a 24-hour hackathon! We don't expect you to build everything. Try to focus on the core parts only."**

**Focus on:**
- Core booking flow (seat selection → payment → confirmation)
- Scalability (handle high load)
- DevOps pipeline (CI/CD)
- Load testing (prove your system works)

**Optional/Skip:**
- Admin dashboard
- Advanced UI/UX
- Real payment gateway integration
- SMS service integration
- Advanced monitoring (bonus only)

### Code of Conduct:
- Any unfair attempts will result in **disqualification**
- Misbehavior or breach of terms will result in **disqualification**
- The organizers reserve the right to make final decisions
- Participants will be notified if there are notable rule modifications

---

## 🎯 Key Takeaways

1. **Architecture First**: Solid design is critical for scalability
2. **Keep It Simple**: KISS principle for APIs and data models
3. **Test Early, Test Often**: Unit tests prevent last-minute disasters
4. **Automate Everything**: CI/CD saves time and reduces errors
5. **Measure Performance**: Load testing validates your claims
6. **Document Your Decisions**: Help judges understand your choices

---

## 📚 References

- **Bangladesh Railway Official**: https://eticket.railway.gov.bd/
- **Prothom Alo**: Traffic statistics during Eid 2024
- **Dhaka Tribune**: Verified hit counts and booking attempts
- **Daily Observer**: System downtime and glitches
- **The Daily Star**: Black market ticketing investigations

---

## 🏆 Judging Criteria (Expected)

| Criteria | Weight | Description |
|----------|--------|-------------|
| **System Design** | 25% | Architecture, data models, scalability |
| **Implementation** | 30% | Code quality, tests, Docker setup |
| **DevOps Pipeline** | 20% | CI/CD automation, deployment strategy |
| **Load Testing** | 15% | Performance under stress, metrics |
| **Presentation** | 10% | Clarity, demo, explanation |
| **Bonus Tasks** | +20% | IaC, K8s, monitoring, extra tests |

---

## 💡 Pro Tips

1. **Use what you know**: Don't learn new tech during the hackathon
2. **Divide and conquer**: Split work among team members efficiently
3. **Mock early**: Don't waste time on payment/SMS integrations
4. **Test continuously**: Don't wait until the end to test
5. **Document as you go**: Write README and architecture docs in parallel
6. **Sleep is optional**: But burnout is real - pace yourself!

---

**Good luck! May your services scale and your tests pass! 🚀**
