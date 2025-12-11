#!/bin/bash

# Complete setup script for local Minikube development
# This will set up everything from scratch

set -e

echo "🚀 Setting up Jatra Railway on Minikube"
echo "========================================="
echo ""

# Step 1: Check prerequisites
echo "Step 1/7: Checking prerequisites..."

if ! command -v minikube &> /dev/null; then
    echo "❌ Minikube not found. Install it:"
    echo "   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
    echo "   sudo install minikube-linux-amd64 /usr/local/bin/minikube"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Install it:"
    echo "   curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    echo "   sudo install kubectl /usr/local/bin/kubectl"
    exit 1
fi

echo "✅ Prerequisites satisfied"
echo ""

# Step 2: Start Minikube
echo "Step 2/7: Starting Minikube cluster..."

if minikube status &> /dev/null; then
    echo "✅ Minikube already running"
else
    echo "Starting Minikube (this may take a few minutes)..."
    minikube start --cpus=4 --memory=8192 --disk-size=20g --driver=docker
    echo "✅ Minikube started"
fi

echo ""

# Step 3: Enable addons
echo "Step 3/7: Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server
echo "✅ Addons enabled"
echo ""

# Step 4: Build images
echo "Step 4/7: Building Docker images in Minikube..."
./infra/scripts/build-minikube.sh
echo ""

# Step 5: Update deployment manifests for local development
echo "Step 5/7: Preparing deployment manifests..."

# Create temporary directory for modified manifests
mkdir -p /tmp/jatra-k8s-local

# Update image references and pull policy for local development
for file in infra/kubernetes/deployments/*.yaml; do
    filename=$(basename "$file")
    sed 's|localhost:5000/jatra/|jatra/|g; s|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' "$file" > "/tmp/jatra-k8s-local/$filename"
done

echo "✅ Manifests prepared"
echo ""

# Step 6: Deploy to Kubernetes
echo "Step 6/7: Deploying to Kubernetes..."

# Create namespace
kubectl apply -f infra/kubernetes/base/namespace.yaml

# Apply ConfigMaps
kubectl apply -f infra/kubernetes/configmaps/

# Apply Secrets
kubectl apply -f infra/kubernetes/secrets/

# Deploy PostgreSQL
kubectl apply -f infra/kubernetes/statefulsets/postgres.yaml
echo "  Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n jatra --timeout=300s || echo "  ⚠️  PostgreSQL still starting..."

# Deploy Redis
kubectl apply -f infra/kubernetes/deployments/redis.yaml
echo "  Waiting for Redis..."
kubectl wait --for=condition=ready pod -l app=redis -n jatra --timeout=120s || echo "  ⚠️  Redis still starting..."

# Deploy RabbitMQ
kubectl apply -f infra/kubernetes/statefulsets/rabbitmq.yaml
echo "  Waiting for RabbitMQ..."
kubectl wait --for=condition=ready pod -l app=rabbitmq -n jatra --timeout=300s || echo "  ⚠️  RabbitMQ still starting..."

# Deploy services using modified manifests
kubectl apply -f /tmp/jatra-k8s-local/

# Apply HPA
kubectl apply -f infra/kubernetes/hpa/

# Apply Ingress
kubectl apply -f infra/kubernetes/ingress/

echo "✅ Deployment complete"
echo ""

# Step 7: Display access information
echo "Step 7/7: Getting access information..."
echo ""

MINIKUBE_IP=$(minikube ip)

echo "========================================="
echo "🎉 Setup Complete!"
echo "========================================="
echo ""
echo "Minikube IP: $MINIKUBE_IP"
echo ""
echo "Add to /etc/hosts:"
echo "  sudo bash -c \"echo '$MINIKUBE_IP api.jatra.local jatra.local' >> /etc/hosts\""
echo ""
echo "Access services:"
echo "  - API Gateway: http://api.jatra.local/api/health"
echo "  - RabbitMQ: http://api.jatra.local/rabbitmq (admin/jatra_rabbitmq_pass)"
echo ""
echo "Useful commands:"
echo "  - Check status: ./infra/scripts/check-health.sh"
echo "  - View logs: kubectl logs -f deployment/auth-service -n jatra"
echo "  - Open dashboard: minikube dashboard"
echo "  - Access service: minikube service api-gateway -n jatra"
echo "  - Stop cluster: minikube stop"
echo "  - Delete cluster: minikube delete"
echo ""
echo "Checking deployment status..."
sleep 5
./infra/scripts/check-health.sh
