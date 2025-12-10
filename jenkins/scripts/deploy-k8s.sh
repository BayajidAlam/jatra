#!/bin/bash
# Deploy services to Kubernetes

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2
NAMESPACE="jatra"

echo "🚀 Deploying to Kubernetes..."
echo ""

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE > /dev/null 2>&1; then
    echo "⚠️  Namespace $NAMESPACE does not exist. Creating it..."
    kubectl apply -f /workspace/infra/kubernetes/base/namespace.yaml
fi

# Deploy infrastructure first (if not exists)
echo "📦 Ensuring infrastructure is deployed..."
kubectl apply -f /workspace/infra/kubernetes/base/ 2>/dev/null || true
kubectl apply -f /workspace/infra/kubernetes/secrets/ 2>/dev/null || true
kubectl apply -f /workspace/infra/kubernetes/configmaps/ 2>/dev/null || true
kubectl apply -f /workspace/infra/kubernetes/statefulsets/ 2>/dev/null || true

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=60s 2>/dev/null || echo "   PostgreSQL already running"
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=60s 2>/dev/null || echo "   Redis already running"

# Deploy services
if [ "$BUILD_MODE" = "ALL_SERVICES" ] || [ -z "$CHANGED_SERVICES" ]; then
    echo "📦 Deploying all services..."
    kubectl apply -f /workspace/infra/kubernetes/deployments/
else
    echo "📦 Deploying changed services: $CHANGED_SERVICES"
    for service in $CHANGED_SERVICES; do
        if [ -f "/workspace/infra/kubernetes/deployments/$service-deployment.yaml" ]; then
            kubectl apply -f /workspace/infra/kubernetes/deployments/$service-deployment.yaml
            # Force pod restart to use new image
            kubectl rollout restart deployment/$service -n $NAMESPACE 2>/dev/null || echo "   Deployment not found: $service"
        fi
    done
fi

echo ""
echo "✅ Kubernetes deployment completed"
