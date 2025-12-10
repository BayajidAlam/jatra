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

# Check if Minikube is running (run on host via docker)
if ! docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ~/.minikube:/root/.minikube alpine/k8s:1.28.0 sh -c "minikube status > /dev/null 2>&1"; then
    echo "⚠️  Cannot verify Minikube status from Jenkins. Assuming it's running..."
fi

# Load images in parallel
for service in "${SERVICES_TO_LOAD[@]}"; do
    if [ "$service" = "api-gateway" ]; then
        continue
    fi
    
    (
        echo "   Loading $service..."
        # Save image from Jenkins' docker and load to Minikube
        if docker save jatra/$service:latest | docker exec -i $(docker ps -q -f name=minikube) docker image load > /dev/null 2>&1; then
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
