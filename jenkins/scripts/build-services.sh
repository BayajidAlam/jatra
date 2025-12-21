#!/bin/bash
# Build Docker images for services

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2
IMAGE_TAG=${3:-"latest"}

# Clean up old temp files
rm -f /tmp/failed-builds.txt

SERVICES=(
    "api-gateway"
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

# If no services to build, exit successfully
if [ ${#SERVICES_TO_BUILD[@]} -eq 0 ]; then
    echo "✅ No services to build"
    exit 0
fi

BUILD_START=$(date +%s)
FAILED_BUILDS=""
SUCCESS_COUNT=0
BUILT_COUNT=0

# Build services in parallel with proper progress tracking
echo "🚀 Starting parallel builds..."
rm -f /tmp/build-results.txt

for service in "${SERVICES_TO_BUILD[@]}"; do
    # Check if Dockerfile exists
    if [ ! -f "/workspace/apps/$service/Dockerfile" ]; then
        echo "   ⏭️  Skipping $service (no Dockerfile)"
        continue
    fi
    
    BUILT_COUNT=$((BUILT_COUNT + 1))
    echo "   📦 $service - build started"
    
    (
        BUILD_LOG="/tmp/build-$service.log"
        
        # Add timestamp to log
        echo "=== Build started at $(date) ===" > "$BUILD_LOG"
        
        if /usr/bin/docker build \
            -f /workspace/apps/$service/Dockerfile \
            -t jatra/$service:$IMAGE_TAG \
            -t jatra/$service:latest \
            /workspace >> "$BUILD_LOG" 2>&1; then
            
            echo "SUCCESS:$service" >> /tmp/build-results.txt
            echo "   ✅ $service"
        else
            echo "FAILED:$service" >> /tmp/build-results.txt
            echo "   ❌ $service"
        fi
    ) &
done

echo ""
echo "⏳ Waiting for builds to complete (5-10 mins)..."

# Wait for all background builds to complete
wait

echo ""
echo "=================================================="
echo "📊 BUILD SUMMARY"
echo "=================================================="

# If nothing was built (all skipped), exit successfully
if [ $BUILT_COUNT -eq 0 ]; then
    echo "✅ All services were skipped"
    exit 0
fi

# Parse and display results
SUCCESS_SERVICES=""
FAILED_SERVICES=""

if [ -f /tmp/build-results.txt ]; then
    while IFS=: read -r status service; do
        if [ "$status" = "SUCCESS" ]; then
            SUCCESS_SERVICES="$SUCCESS_SERVICES $service"
            echo "✅ $service"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            FAILED_SERVICES="$FAILED_SERVICES $service"
            echo "❌ $service"
            echo "$service" >> /tmp/failed-builds.txt
        fi
    done < /tmp/build-results.txt
else
    echo "⚠️  No build results found"
    exit 1
fi

# Show detailed errors for failed builds
if [ -n "$FAILED_SERVICES" ]; then
    echo ""
    echo "=================================================="
    echo "🔄 RETRYING FAILED BUILDS (attempt 2/2)"
    echo "=================================================="
    
    RETRY_FAILED=""
    for service in $FAILED_SERVICES; do
        echo "   📦 $service - retrying build"
        
        BUILD_LOG="/tmp/build-$service.log"
        echo "=== Retry started at $(date) ===" >> "$BUILD_LOG"
        
        if /usr/bin/docker build \
            -f /workspace/apps/$service/Dockerfile \
            -t jatra/$service:$IMAGE_TAG \
            -t jatra/$service:latest \
            /workspace >> "$BUILD_LOG" 2>&1; then
            
            echo "SUCCESS:$service" >> /tmp/build-results.txt
            echo "   ✅ $service (retry successful)"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            RETRY_FAILED="$RETRY_FAILED $service"
            echo "   ❌ $service (retry failed)"
        fi
    done
    
    # Update failed services list
    FAILED_SERVICES="$RETRY_FAILED"
fi

# Final error reporting
if [ -n "$FAILED_SERVICES" ]; then
    echo ""
    echo "=================================================="
    echo "❌ ERROR DETAILS"
    echo "=================================================="
    
    for service in $FAILED_SERVICES; do
        echo ""
        echo "--- $service errors (last 40 lines) ---"
        tail -40 /tmp/build-$service.log | grep -A 5 -E "ERROR|error|Error|failed|FAILED|TS[0-9]{4}" || tail -20 /tmp/build-$service.log
        echo ""
    done
    
    echo "Full logs: /tmp/build-*.log"
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
