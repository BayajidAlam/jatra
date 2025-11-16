# 🚂 Jatra - Scalable Railway Ticketing System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28%2B-blue)](https://kubernetes.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192)](https://www.postgresql.org/)

> **Solving Bangladesh Railway's Eid Rush Crisis: A Kubernetes-Native, Microservices-Based Ticketing Platform**

---

## 📚 Quick Links

- 📋 [Hackathon Problem Statement](docs/HACKATHON_PROBLEM_STATEMENT.md)
- 🔍 [Shohoz System Analysis](docs/SHOHOZ_ANALYSIS.md)
- 🏗️ [Architecture Documentation](docs/ARCHITECTURE.md)
- 🗄️ [Database Schemas](docs/database/SCHEMA.md)
- 📊 [Entity Relationship Diagram](docs/database/ERD.md)
- 🎤 [BSc Defense Slides](docs/PROPOSAL_DEFENSE_SLIDES.md)

---

## 🌟 Project Origin: BUET CSE Hackathon 2024

### Event Details
- **Event**: Microservice & DevOps Hackathon
- **Date**: October 24, 2024
- **Location**: Department of Computer Science and Engineering, BUET
- **Duration**: 24 hours
- **Challenge**: Build a scalable ticketing system for Bangladesh Railway

### The Real-World Crisis

**Masum's Story**: A software engineer couldn't book an Eid train ticket home despite being logged in early. The system froze, OTP never arrived after 5 minutes, and multiple retries failed. **He wasn't alone** - thousands faced the same issue.

**Verified Statistics (2024)**:
- **30 million hits in 30 minutes** during Eid-ul-Azha
- **1,187+ concurrent attempts per single seat**
- **60-90% booking failure rate** during peak periods
- **80,000-100,000 tickets sold daily** (normal days)
- **1.4 million registered users**, 77 stations

**Current System Failures (Shohoz)**:
- 🚨 4 employees arrested for black market ticketing (March 2024)
- 💰 Tk 2 lakh consumer rights fine for mismanagement
- 💸 Tk 25 crore advertising revenue lost to Bangladesh Railway
- ❌ System crashes, OTP delays (5+ minutes), frozen bookings

**Full Analysis**: [SHOHOZ_ANALYSIS.md](docs/SHOHOZ_ANALYSIS.md)

---

## 🚀 Project Overview

### The Problem

Bangladesh Railway's e-ticketing system (operated by Shohoz) crashes during Eid with extreme traffic:
- **Peak Traffic**: 30M+ hits in 30 minutes
- **Concurrent Attempts**: 1,187+ users trying to book a single seat
- **System Response**: Crashes, OTP delays, failed bookings
- **User Impact**: Unable to purchase tickets despite multiple attempts

### Our Solution

**Jatra** (জাত্রা - Bengali for "journey") is a fault-tolerant, horizontally scalable microservices system featuring:

✅ **11 Microservices**: Independent services for auth, booking, payment, tickets, etc.  
✅ **Atomic Seat Locking**: Redis `SET NX EX` handles 1,187+ concurrent attempts  
✅ **Auto-Scaling**: Kubernetes HPA scales 5-20 pods per service during traffic spikes  
✅ **Database-per-Service**: 11 PostgreSQL databases for isolation  
✅ **Hybrid Communication**: API Gateway + HTTP (sync) + RabbitMQ (async)  
✅ **Comprehensive Monitoring**: Prometheus, Grafana, Jaeger, OpenTelemetry  
✅ **Zero Downtime**: Rolling deployments via Kubernetes  
✅ **Load Tested**: k6 scripts for breakpoint testing  

### Key Innovation

**Redis Atomic Locking** prevents race conditions when 1,187+ users attempt to book the same seat:
```redis
SET seat:train_123_coach_A_seat_42 user:456 NX EX 300
# NX = Only set if not exists (atomic)
# EX 300 = Expires in 5 minutes (auto-release)
```

**Response Time**: 5-10ms (vs 100-500ms for database locks)  
**Success Rate Target**: 99.9% during peak traffic

## 📁 Project Structure

```
jatra-railway/
├── apps/                  # Client applications (web, admin)
├── services/              # Backend microservices (11 services)
├── libs/                  # Shared libraries (common, database, messaging, etc.)
├── infra/                 # Infrastructure as Code (K8s, Pulumi, Docker)
├── scripts/               # Automation scripts
├── tests/                 # E2E, integration, and load tests
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

- **Backend:** NestJS (TypeScript), Go (API Gateway)
- **Frontend:** Next.js 14+ (TypeScript)
- **Databases:** PostgreSQL 15+, Redis 7+ Cluster
- **Message Queue:** RabbitMQ
- **Payment:** SSLCommerz
- **Orchestration:** Kubernetes + Helm
- **CI/CD:** Jenkins
- **IaC:** Pulumi
- **Monitoring:** Prometheus + Grafana + OpenTelemetry

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Go 1.21+ (for API Gateway)

### Installation

```bash
# Clone the repository
git clone https://github.com/BayajidAlam/jatra.git
cd jatra

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure services (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Verify services are running
docker-compose ps

# Start a microservice (once implemented)
pnpm nx serve <service-name>
```

### Quick Start

```bash
# Start all infrastructure
docker-compose up -d

# Access services:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - RabbitMQ Management: http://localhost:15672

# Start optional management tools
docker-compose --profile tools up -d
# - PgAdmin: http://localhost:5050
# - Redis Commander: http://localhost:8081
```

## 📦 Nx Commands

```bash
# Run a service
pnpm nx serve <service-name>

# Test
pnpm nx test <service-name>
pnpm nx affected:test

# Build
pnpm nx build <service-name>
pnpm nx affected:build

# View dependency graph
pnpm nx graph
```

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:

```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
