# Jatra Infrastructure Documentation

## Overview

This directory contains all infrastructure-as-code (IaC), Docker, Kubernetes, and Helm configurations for the Jatra Railway Ticketing System.

## Directory Structure

```
infra/
├── docker/
│   ├── postgres/
│   │   └── init.sql              # Database initialization script
│   └── [Future: Dockerfiles for each service]
├── kubernetes/
│   └── base/
│       ├── namespace.yaml        # Kubernetes namespace
│       ├── configmap.yaml        # Configuration values
│       ├── secrets.yaml          # Sensitive data (use sealed-secrets in prod)
│       ├── service-template.yaml # Template for microservices
│       └── ingress.yaml          # Ingress configuration
├── helm/
│   └── jatra/
│       ├── Chart.yaml            # Helm chart metadata
│       ├── values.yaml           # Default values
│       └── templates/            # [Future: Helm templates]
└── README.md                     # This file
```

---

## Local Development Setup

### Prerequisites

- Docker 20+ and Docker Compose
- Node.js 20+
- pnpm 8+

### Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, RabbitMQ
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | User: `jatra_user`, Pass: `jatra_password` |
| Redis | `localhost:6379` | Pass: `jatra_redis_pass` |
| RabbitMQ Management | `http://localhost:15672` | User: `jatra_user`, Pass: `jatra_password` |
| PgAdmin (optional) | `http://localhost:5050` | Email: `admin@jatra.com`, Pass: `admin123` |
| Redis Commander (optional) | `http://localhost:8081` | No auth |

**To start optional tools:**
```bash
docker-compose --profile tools up -d
```

### Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
# Edit .env with your configuration
```

---

## Production Deployment (Kubernetes)

### Prerequisites

- Kubernetes cluster 1.28+
- kubectl configured
- Helm 3+
- cert-manager (for TLS certificates)
- NGINX Ingress Controller

### Deploy with kubectl

1. **Create namespace and secrets:**

```bash
# Create namespace
kubectl apply -f infra/kubernetes/base/namespace.yaml

# Create secrets (update secrets.yaml first!)
kubectl apply -f infra/kubernetes/base/secrets.yaml

# Create config
kubectl apply -f infra/kubernetes/base/configmap.yaml
```

2. **Deploy services:**

```bash
# Deploy all microservices (replicate service-template.yaml for each service)
kubectl apply -f infra/kubernetes/base/

# Check deployment status
kubectl get pods -n jatra
kubectl get services -n jatra
kubectl get ingress -n jatra
```

### Deploy with Helm (Recommended)

```bash
# Install/Upgrade Jatra
helm upgrade --install jatra ./infra/helm/jatra \
  --namespace jatra \
  --create-namespace \
  --values ./infra/helm/jatra/values.yaml

# Check status
helm status jatra -n jatra

# Uninstall
helm uninstall jatra -n jatra
```

### Configure TLS/SSL

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@jatra.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

## Scaling Configuration

### Horizontal Pod Autoscaler (HPA)

HPA is configured for all critical services:

```yaml
# Example: Seat Reservation Service (handles highest load)
minReplicas: 5
maxReplicas: 20
targetCPUUtilizationPercentage: 70
```

**During Eid rush, services auto-scale:**
- API Gateway: 3 → 10 pods
- Seat Reservation: 5 → 20 pods
- Booking Service: 3 → 15 pods
- Search Service: 3 → 15 pods
- Notification Service: 5 → 15 pods

### Manual Scaling

```bash
# Scale specific service
kubectl scale deployment seat-reservation-service --replicas=10 -n jatra

# Check HPA status
kubectl get hpa -n jatra
```

### Cluster Autoscaler

Configure cluster autoscaler to add nodes when pods can't be scheduled:

```bash
# AWS EKS example
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

---

## Monitoring Setup

### Prometheus + Grafana

```bash
# Install kube-prometheus-stack with Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring-values.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Username: admin, Password: prom-operator
```

### Key Metrics to Monitor

1. **Request Rate**: Requests per second per service
2. **Error Rate**: 5xx errors percentage
3. **Latency**: p50, p95, p99 response times
4. **Seat Locks**: Redis SET operations per second
5. **Queue Depth**: RabbitMQ message backlog
6. **Database Connections**: Active PostgreSQL connections
7. **Pod CPU/Memory**: Resource utilization

---

## Database Management

### Migrations

```bash
# Run migrations for all services
pnpm nx run-many --target=migrate --all

# Run migration for specific service
pnpm nx run auth-service:migrate
```

### Backup & Restore

```bash
# Backup PostgreSQL
kubectl exec -n jatra postgres-0 -- pg_dumpall -U jatra_user > backup.sql

# Restore
kubectl exec -i -n jatra postgres-0 -- psql -U jatra_user < backup.sql
```

### Seed Data (Development)

```bash
# Seed sample data
pnpm nx run schedule-service:seed
```

---

## Redis Configuration

### Cluster Mode (Production)

For production, use Redis Cluster for high availability:

```bash
# Install Redis Cluster with Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis-cluster \
  --namespace jatra \
  --set password=jatra_redis_pass \
  --set cluster.nodes=6 \
  --set persistence.enabled=true
```

### Key Patterns

```
# Seat locks
seat:{trainId}:{coachId}:{seatNumber}:{journeyDate}
TTL: 300s

# OTP cache
otp:{phone}
TTL: 300s

# Search cache
search:trains:{origin}:{destination}:{date}
TTL: 3600s

# User session
session:{userId}:{sessionId}
TTL: 604800s (7 days)
```

---

## RabbitMQ Configuration

### Exchanges and Queues

```bash
# Create exchanges (run once after RabbitMQ startup)
kubectl exec -n jatra rabbitmq-0 -- rabbitmqadmin declare exchange \
  name=booking_exchange type=topic durable=true

kubectl exec -n jatra rabbitmq-0 -- rabbitmqadmin declare exchange \
  name=payment_exchange type=topic durable=true

kubectl exec -n jatra rabbitmq-0 -- rabbitmqadmin declare exchange \
  name=notification_exchange type=topic durable=true
```

### Event Patterns

```
booking.created → booking_exchange
booking.confirmed → booking_exchange
payment.completed → payment_exchange
payment.failed → payment_exchange
notification.sms.send → notification_exchange
notification.email.send → notification_exchange
```

---

## Security Best Practices

### Secrets Management

**DO NOT commit secrets to Git!**

**Option 1: Sealed Secrets**
```bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Seal a secret
kubectl create secret generic jatra-secrets \
  --from-literal=POSTGRES_PASSWORD=xxx \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secrets.yaml

# Apply sealed secret
kubectl apply -f sealed-secrets.yaml
```

**Option 2: External Secrets Operator** (Recommended for AWS/Azure/GCP)
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

### Network Policies

```bash
# Apply network policies to restrict traffic
kubectl apply -f infra/kubernetes/network-policies/
```

### Pod Security Standards

```bash
# Enforce restricted pod security
kubectl label namespace jatra pod-security.kubernetes.io/enforce=restricted
```

---

## CI/CD Integration

### Jenkins Pipeline Example

```groovy
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'pnpm install'
        sh 'pnpm nx affected:build --base=main'
      }
    }
    stage('Test') {
      steps {
        sh 'pnpm nx affected:test --base=main'
      }
    }
    stage('Deploy to Dev') {
      steps {
        sh 'helm upgrade --install jatra ./infra/helm/jatra -n dev'
      }
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**1. Pod not starting**
```bash
kubectl describe pod <pod-name> -n jatra
kubectl logs <pod-name> -n jatra
```

**2. Database connection issues**
```bash
# Check if PostgreSQL is running
kubectl get pods -n jatra | grep postgres

# Test connection from pod
kubectl exec -it <service-pod> -n jatra -- nc -zv postgres-service 5432
```

**3. Redis connection issues**
```bash
# Test Redis connection
kubectl exec -it <service-pod> -n jatra -- redis-cli -h redis-service -p 6379 -a jatra_redis_pass ping
```

**4. High CPU/Memory**
```bash
# Check resource usage
kubectl top pods -n jatra

# Check HPA status
kubectl describe hpa <service-name>-hpa -n jatra
```

---

## Cost Optimization

### Resource Requests vs Limits

- Set **requests** based on typical usage (guaranteed resources)
- Set **limits** 2-3x higher than requests (burst capacity)
- Use HPA to scale pods instead of over-provisioning

### Spot Instances (AWS)

```bash
# Use spot instances for non-critical workloads
eksctl create nodegroup \
  --cluster=jatra-cluster \
  --node-type=t3.medium \
  --spot \
  --nodes=3 \
  --nodes-min=3 \
  --nodes-max=10
```

---

## Performance Tuning

### Database Connection Pooling

```typescript
// TypeORM configuration
{
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'auth_db',
  extra: {
    max: 20,              // Max connections per pod
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  }
}
```

### Redis Optimization

```bash
# Set maxmemory and eviction policy
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### RabbitMQ Prefetch

```typescript
// Limit messages consumed per worker
channel.prefetch(10);
```

---

## Disaster Recovery

### Backup Strategy

1. **Database**: Daily automated backups with 30-day retention
2. **Redis**: RDB snapshots every 5 minutes
3. **Configuration**: All K8s manifests in Git (GitOps)

### Recovery Procedure

```bash
# 1. Deploy infrastructure
kubectl apply -f infra/kubernetes/base/

# 2. Restore database
kubectl exec -i postgres-0 -n jatra -- psql -U jatra_user < backup.sql

# 3. Deploy services
helm upgrade --install jatra ./infra/helm/jatra -n jatra

# 4. Verify
kubectl get pods -n jatra
```

---

## Further Reading

- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Helm Documentation](https://helm.sh/docs/)
- [12-Factor App Methodology](https://12factor.net/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)

---

**Last Updated**: November 16, 2025
