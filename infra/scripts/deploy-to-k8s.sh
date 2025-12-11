#!/bin/bash

# Script to deploy Jatra Railway Ticketing System to Kubernetes
# Usage: ./deploy-to-k8s.sh [environment]
# Example: ./deploy-to-k8s.sh dev

set -e

ENVIRONMENT=${1:-"dev"}

echo "🚀 Deploying Jatra Railway to Kubernetes"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster."
    echo "Make sure your cluster is running (minikube start / kind create cluster)"
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"
echo ""

# Step 1: Create namespace
echo "📦 Step 1/8: Creating namespace..."
kubectl apply -f infra/kubernetes/base/namespace.yaml
echo ""

# Step 2: Apply ConfigMaps
echo "⚙️  Step 2/8: Applying ConfigMaps..."
kubectl apply -f infra/kubernetes/configmaps/
echo ""

# Step 3: Apply Secrets
echo "🔐 Step 3/8: Applying Secrets..."
kubectl apply -f infra/kubernetes/secrets/
echo ""

# Step 4: Deploy PostgreSQL
echo "🗄️  Step 4/8: Deploying PostgreSQL..."
kubectl apply -f infra/kubernetes/statefulsets/postgres.yaml
echo "  Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n jatra --timeout=300s
echo "  ✅ PostgreSQL is ready"
echo ""

# Step 5: Deploy Redis
echo "💾 Step 5/8: Deploying Redis..."
kubectl apply -f infra/kubernetes/deployments/redis.yaml
echo "  Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n jatra --timeout=120s
echo "  ✅ Redis is ready"
echo ""

# Step 6: Deploy RabbitMQ
echo "🐰 Step 6/8: Deploying RabbitMQ..."
kubectl apply -f infra/kubernetes/statefulsets/rabbitmq.yaml
echo "  Waiting for RabbitMQ to be ready..."
kubectl wait --for=condition=ready pod -l app=rabbitmq -n jatra --timeout=300s
echo "  ✅ RabbitMQ is ready"
echo ""

# Step 7: Deploy all backend services
echo "🚀 Step 7/8: Deploying backend services..."
kubectl apply -f infra/kubernetes/deployments/
echo "  Waiting for services to be ready (this may take a few minutes)..."
sleep 30  # Give services time to start
kubectl wait --for=condition=ready pod -l app=api-gateway -n jatra --timeout=300s || echo "  ⚠️  Some services may still be starting..."
echo "  ✅ Services deployed"
echo ""

# Step 8: Apply HPA and Ingress
echo "📊 Step 8/8: Applying HPA and Ingress..."
kubectl apply -f infra/kubernetes/hpa/
kubectl apply -f infra/kubernetes/ingress/
echo ""

# Get deployment status
echo "========================================="
echo "Deployment Status"
echo "========================================="
echo ""

echo "Pods:"
kubectl get pods -n jatra
echo ""

echo "Services:"
kubectl get svc -n jatra
echo ""

echo "Ingress:"
kubectl get ingress -n jatra
echo ""

echo "HPA:"
kubectl get hpa -n jatra
echo ""

# Instructions
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Add to /etc/hosts:"
echo "   127.0.0.1 api.jatra.local jatra.local"
echo ""
echo "2. Access services:"
echo "   - API Gateway: http://api.jatra.local/api/health"
echo "   - RabbitMQ Management: http://api.jatra.local/rabbitmq"
echo "   - Swagger Docs: http://api.jatra.local/docs/{service}"
echo ""
echo "3. Port forward (alternative):"
echo "   kubectl port-forward svc/api-gateway 3000:3000 -n jatra"
echo ""
echo "4. View logs:"
echo "   kubectl logs -f deployment/auth-service -n jatra"
echo ""
echo "5. Check service health:"
echo "   ./infra/scripts/check-health.sh"
echo ""
echo "🎉 Deployment complete!"
