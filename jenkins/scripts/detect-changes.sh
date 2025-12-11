#!/bin/bash
# Detect which services have changed since last commit

set -e

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
    "api-gateway"
)

CHANGED_SERVICES=""

# Get the previous commit (if exists)
PREV_COMMIT=$(git rev-parse HEAD~1 2>/dev/null || echo "")

if [ -z "$PREV_COMMIT" ]; then
    echo "⚠️  No previous commit found. Marking all services as changed."
    CHANGED_SERVICES="${SERVICES[@]}"
else
    echo "🔍 Comparing current commit with: $PREV_COMMIT"
    
    # Check each service for changes
    for service in "${SERVICES[@]}"; do
        if [ "$service" = "api-gateway" ]; then
            SERVICE_PATH="apps/api-gateway"
        else
            SERVICE_PATH="apps/$service"
        fi
        
        # Check if service directory or shared libs changed
        if git diff --name-only $PREV_COMMIT HEAD | grep -q "^$SERVICE_PATH/\|^libs/"; then
            echo "   ✓ $service changed"
            CHANGED_SERVICES="$CHANGED_SERVICES $service"
        else
            echo "   - $service unchanged"
        fi
    done
fi

# Write to file for next stage
echo "$CHANGED_SERVICES" | xargs > changed-services.txt

echo ""
echo "📋 Changed services: ${CHANGED_SERVICES:-none}"
echo "Changed services list saved to: changed-services.txt"
