#!/bin/bash
# Load Docker images to Minikube

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2

SERVICES=(
    "auth-service"
    "user-service"
    "schedule-service"
    "search-service"
    "seat-reservation-service"
    "booking-service"
    "payment-service"
    "ticket-service"
    "notification-service"
    "admin-service"
    "reporting-service"
)

# Determine which services to load
if [ "$BUILD_MODE" = "ALL_SERVICES" ]; then
    SERVICES_TO_LOAD=("${SERVICES[@]}")
else
    SERVICES_TO_LOAD=($CHANGED_SERVICES)
fi

echo "📥 Loading images to Minikube..."
echo ""

# Check if Minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Please start it first."
    exit 1
fi

# Load images in parallel
for service in "${SERVICES_TO_LOAD[@]}"; do
    if [ "$service" = "api-gateway" ]; then
        continue
    fi
    
    (
        echo "   Loading $service..."
        minikube image rm docker.io/jatra/$service:latest 2>/dev/null || true
        if minikube image load jatra/$service:latest > /dev/null 2>&1; then
            echo "   ✅ $service loaded"
        else
            echo "   ❌ $service load failed"
        fi
    ) &
done

# Wait for all loads to complete
wait

echo ""
echo "✅ All images loaded to Minikube"
