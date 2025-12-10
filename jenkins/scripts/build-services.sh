#!/bin/bash
# Build Docker images for services

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2
IMAGE_TAG=${3:-"latest"}

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

# Determine which services to build
if [ "$BUILD_MODE" = "ALL_SERVICES" ]; then
    SERVICES_TO_BUILD=("${SERVICES[@]}")
else
    # Build only changed services
    SERVICES_TO_BUILD=($CHANGED_SERVICES)
fi

echo "🏗️  Building Docker images..."
echo "Mode: $BUILD_MODE"
echo "Services: ${SERVICES_TO_BUILD[@]}"
echo ""

BUILD_START=$(date +%s)
FAILED_BUILDS=""
SUCCESS_COUNT=0

# Build services in parallel (background processes)
for service in "${SERVICES_TO_BUILD[@]}"; do
    if [ "$service" = "api-gateway" ]; then
        continue  # Skip api-gateway for now (Go binary)
    fi
    
    (
        echo "   Building $service..."
        if docker build \
            -f /workspace/apps/$service/Dockerfile \
            -t jatra/$service:$IMAGE_TAG \
            -t jatra/$service:latest \
            /workspace > /tmp/build-$service.log 2>&1; then
            echo "   ✅ $service built successfully"
        else
            echo "   ❌ $service build failed"
            echo "$service" >> /tmp/failed-builds.txt
        fi
    ) &
done

# Wait for all background builds to complete
wait

# Check for failed builds
if [ -f /tmp/failed-builds.txt ]; then
    FAILED_BUILDS=$(cat /tmp/failed-builds.txt)
    echo ""
    echo "❌ Failed builds:"
    cat /tmp/failed-builds.txt
    echo ""
    echo "Build logs available in /tmp/build-*.log"
    exit 1
fi

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo ""
echo "✅ All Docker images built successfully in ${BUILD_TIME}s"
echo ""

# Save build summary
cat > build-summary.txt <<EOF
Build Mode: $BUILD_MODE
Services Built: ${#SERVICES_TO_BUILD[@]}
Build Time: ${BUILD_TIME}s
Image Tag: $IMAGE_TAG
Status: SUCCESS
EOF
