#!/bin/bash

# Manual Test Script for Jatra Railway Booking Flow
# Tests the complete booking orchestration with retry logic and event propagation

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Jatra Railway Booking Flow Test ===${NC}\n"

# Configuration
BOOKING_SERVICE="http://localhost:3001"
PAYMENT_SERVICE="http://localhost:3002"
SEAT_SERVICE="http://localhost:3003"
NOTIFICATION_SERVICE="http://localhost:3004"
TICKET_SERVICE="http://localhost:3005"

# Test data
USER_ID="test-user-123"
JOURNEY_ID="test-journey-456"
SEAT_IDS='["seat-1", "seat-2"]'
TOTAL_AMOUNT=1500
PAYMENT_METHOD="BKASH"

echo -e "${YELLOW}Step 1: Check if all services are running${NC}"
check_service() {
    local name=$1
    local url=$2
    if curl -s -o /dev/null -w "%{http_code}" "$url/health" | grep -q "200\|404"; then
        echo -e "${GREEN}✓${NC} $name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not running at $url"
        return 1
    fi
}

# Check services (skip if health endpoint doesn't exist)
echo "Checking services..."
# check_service "Booking Service" "$BOOKING_SERVICE"
# check_service "Payment Service" "$PAYMENT_SERVICE"
# check_service "Seat Reservation Service" "$SEAT_SERVICE"
# check_service "Notification Service" "$NOTIFICATION_SERVICE"
# check_service "Ticket Service" "$TICKET_SERVICE"
echo ""

echo -e "${YELLOW}Step 2: Test Create Booking (with HTTP retry)${NC}"
echo "Creating booking with seat locking and payment initiation..."

CREATE_BOOKING_RESPONSE=$(cat <<EOF
{
  "userId": "$USER_ID",
  "journeyId": "$JOURNEY_ID",
  "seatIds": $SEAT_IDS,
  "fromStationId": "station-dhaka",
  "toStationId": "station-chittagong",
  "totalAmount": $TOTAL_AMOUNT,
  "paymentMethod": "$PAYMENT_METHOD",
  "paymentDetails": {
    "phoneNumber": "+8801712345678"
  }
}
EOF
)

echo "Request payload:"
echo "$CREATE_BOOKING_RESPONSE" | jq '.'
echo ""

# Uncomment to test actual API
# BOOKING_RESULT=$(curl -s -X POST "$BOOKING_SERVICE/bookings" \
#   -H "Content-Type: application/json" \
#   -d "$CREATE_BOOKING_RESPONSE")
# echo -e "${GREEN}Response:${NC}"
# echo "$BOOKING_RESULT" | jq '.'
# BOOKING_ID=$(echo "$BOOKING_RESULT" | jq -r '.id')
# echo ""

echo -e "${YELLOW}Expected behavior:${NC}"
echo "1. HTTP retry service attempts to lock seats (max 3 retries, 15s timeout)"
echo "2. If seat lock fails, retry with exponential backoff (1s, 2s, 4s)"
echo "3. HTTP retry service initiates payment (max 3 retries, 20s timeout)"
echo "4. Booking created with PAYMENT_PENDING status"
echo "5. No RabbitMQ events emitted yet (waiting for payment confirmation)"
echo ""

echo -e "${YELLOW}Step 3: Test Payment Confirmation${NC}"
echo "Simulating payment confirmation..."

CONFIRM_PAYMENT=$(cat <<EOF
{
  "paymentId": "payment-123",
  "transactionId": "bkash-trx-456789"
}
EOF
)

echo "Request payload:"
echo "$CONFIRM_PAYMENT" | jq '.'
echo ""

# Uncomment to test actual API
# CONFIRM_RESULT=$(curl -s -X POST "$BOOKING_SERVICE/bookings/$BOOKING_ID/confirm" \
#   -H "Content-Type: application/json" \
#   -d "$CONFIRM_PAYMENT")
# echo -e "${GREEN}Response:${NC}"
# echo "$CONFIRM_RESULT" | jq '.'
# echo ""

echo -e "${YELLOW}Expected behavior:${NC}"
echo "1. HTTP retry confirms payment with Payment Service (max 3 retries)"
echo "2. HTTP retry confirms reservation with Seat Service (max 3 retries)"
echo "3. Booking status updated to CONFIRMED"
echo "4. ${GREEN}RabbitMQ event emitted:${NC} booking.confirmed"
echo "   ├─ Notification Service → Sends confirmation email"
echo "   └─ Ticket Service → Generates QR code ticket"
echo ""

echo -e "${YELLOW}Step 4: Test HTTP Retry Logic${NC}"
echo "Testing exponential backoff and error handling..."
echo ""
echo "Retry configuration:"
echo "  • Max retries: 3 attempts"
echo "  • Initial delay: 1000ms"
echo "  • Backoff multiplier: 2x"
echo "  • Max delay: 10000ms"
echo "  • Timeout per request: 15-30s (depends on operation)"
echo "  • Smart retry: Skip 4xx client errors, retry 5xx server errors"
echo ""
echo "Retry sequence on failure:"
echo "  1st attempt → fail → wait 1s"
echo "  2nd attempt → fail → wait 2s"
echo "  3rd attempt → fail → wait 4s"
echo "  4th attempt → success or throw error"
echo ""

echo -e "${YELLOW}Step 5: Test Booking Cancellation (with refund)${NC}"
echo "Simulating booking cancellation..."

CANCEL_BOOKING=$(cat <<EOF
{
  "reason": "User requested cancellation"
}
EOF
)

echo "Request payload:"
echo "$CANCEL_BOOKING" | jq '.'
echo ""

# Uncomment to test actual API
# CANCEL_RESULT=$(curl -s -X POST "$BOOKING_SERVICE/bookings/$BOOKING_ID/cancel" \
#   -H "Content-Type: application/json" \
#   -d "$CANCEL_BOOKING")
# echo -e "${GREEN}Response:${NC}"
# echo "$CANCEL_RESULT" | jq '.'
# echo ""

echo -e "${YELLOW}Expected behavior:${NC}"
echo "1. HTTP retry initiates refund with Payment Service (if payment completed)"
echo "2. HTTP retry cancels reservation with Seat Service"
echo "3. Booking status updated to CANCELLED"
echo "4. ${GREEN}RabbitMQ event emitted:${NC} booking.cancelled"
echo "   └─ Notification Service → Sends cancellation email"
echo ""

echo -e "${YELLOW}Step 6: RabbitMQ Event Verification${NC}"
echo "Check RabbitMQ Management UI to verify events:"
echo "http://localhost:15672 (guest/guest)"
echo ""
echo "Expected exchanges:"
echo "  • booking.exchange (type: topic)"
echo "  • payment.exchange (type: topic)"
echo "  • notification.exchange (type: topic)"
echo ""
echo "Expected queues:"
echo "  • notification.queue (binds to: booking.confirmed, booking.cancelled, payment.*)"
echo "  • ticket.queue (binds to: booking.confirmed)"
echo ""
echo "Expected routing keys:"
echo "  • booking.confirmed"
echo "  • booking.cancelled"
echo "  • payment.completed"
echo "  • payment.failed"
echo ""

echo -e "${YELLOW}Step 7: Database Verification${NC}"
echo "Check database for created records:"
echo ""
echo "psql -d jatra_railway -c \"SELECT id, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 5;\""
echo ""

echo -e "${YELLOW}Step 8: Log Analysis${NC}"
echo "Check service logs for retry attempts:"
echo ""
echo "Expected log patterns:"
echo "  • 'Attempting request to <service> (attempt 1/3)'"
echo "  • '✅ Request succeeded after X attempts'"
echo "  • '⚠️ Retrying request (X/3) after Yms'"
echo "  • '❌ All retry attempts failed'"
echo ""

echo -e "${GREEN}=== Test Script Complete ===${NC}"
echo ""
echo "To run actual API tests:"
echo "1. Start all services: npm run dev (in separate terminals)"
echo "2. Ensure RabbitMQ is running: docker ps | grep rabbitmq"
echo "3. Ensure PostgreSQL is running with migrated schema"
echo "4. Uncomment curl commands in this script"
echo "5. Run: ./test-booking-flow.sh"
echo ""
echo "To simulate service failures for retry testing:"
echo "1. Stop a service temporarily: kill <pid>"
echo "2. Create booking → observe retry attempts in logs"
echo "3. Restart service before retry timeout"
echo "4. Booking should succeed after retry"
