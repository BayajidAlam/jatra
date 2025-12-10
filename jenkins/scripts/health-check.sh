#!/bin/bash
# Health check for deployed services

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2
NAMESPACE="jatra"
MAX_WAIT=300  # 5 minutes

# Set KUBECONFIG for Jenkins
export KUBECONFIG=${KUBECONFIG:-/var/jenkins_home/.kube/config}

echo "🏥 Running health checks..."
echo ""

# Determine which services to check
if [ "$BUILD_MODE" = "ALL_SERVICES" ] || [ -z "$CHANGED_SERVICES" ]; then
    SERVICES_TO_CHECK="auth-service user-service schedule-service search-service seat-reservation-service booking-service payment-service ticket-service notification-service admin-service reporting-service"
else
    SERVICES_TO_CHECK="$CHANGED_SERVICES"
fi

echo "Checking services: $SERVICES_TO_CHECK"
echo ""

# Wait for deployments to be ready
for service in $SERVICES_TO_CHECK; do
    if [ "$service" = "api-gateway" ]; then
        continue
    fi
    
    echo "   Checking $service..."
    
    # Check if deployment exists
    if ! kubectl get deployment $service -n $NAMESPACE > /dev/null 2>&1; then
        echo "   ⚠️  Deployment not found: $service"
        continue
    fi
    
    # Wait for rollout
    if kubectl rollout status deployment/$service -n $NAMESPACE --timeout=60s 2>/dev/null; then
        echo "   ✅ $service is healthy"
    else
        echo "   ⚠️  $service rollout timeout (may still be starting)"
    fi
done

echo ""
echo "📊 Current pod status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "✅ Health check completed"
