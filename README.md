# Jatra - Scalable Railway Ticketing System

A Kubernetes-based microservices architecture for Bangladesh Railway's online ticketing system, designed to handle extreme traffic loads (30M+ hits in 30 minutes) during peak seasons like Eid.

## 🚀 Project Overview

**Problem:** Bangladesh Railway's e-ticketing system crashes during Eid with 1,187+ concurrent attempts per seat, leading to failed bookings and poor user experience.

**Solution:** A fault-tolerant, horizontally scalable microservices system with 11 microservices, atomic seat reservation, SSLCommerz payment, SMS notifications, QR code tickets, and comprehensive observability.

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
# Install dependencies
pnpm install

# Start infrastructure services
docker-compose up -d

# Start a service
pnpm nx serve <service-name>
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
