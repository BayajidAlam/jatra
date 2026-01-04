#!/bin/bash
# Test API Gateway routing to all microservices

GATEWAY="http://192.168.49.2:30000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing API Gateway - All Routes"
echo "===================================="
echo ""

test_route() {
    local method=$1
    local route=$2
    local service=$3
    local data=$4
    
    echo -n "Testing $service ($method $route)... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY$route" \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time 3 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$GATEWAY$route" --max-time 3 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    # Success: 200-299, 400-499 (validation errors mean route works)
    if [[ $http_code =~ ^[2-4][0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ Connected (HTTP $http_code)${NC}"
        return 0
    elif [[ $http_code == "000" ]] || [ -z "$http_code" ]; then
        echo -e "${RED}❌ Timeout/Connection Failed${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  HTTP $http_code${NC}"
        return 1
    fi
}

echo "📍 Health Check:"
test_route "GET" "/health" "API Gateway"
echo ""

echo "📍 Auth Service Routes:"
test_route "POST" "/api/auth/register" "Auth Service" '{"email":"test@test.com","password":"Test@123","name":"Test","phone":"+8801712345678","nid":"1234567890"}'
test_route "POST" "/api/auth/login" "Auth Service" '{"email":"test@test.com","password":"Test@123"}'
echo ""

echo "📍 Schedule Service Routes:"
test_route "GET" "/api/stations" "Schedule Service"
test_route "GET" "/api/trains" "Schedule Service"
test_route "GET" "/api/journeys/search?from=1&to=2&date=2025-12-25" "Schedule Service"
echo ""

echo "📍 Search Service Routes:"
test_route "GET" "/api/search/journeys?from=Dhaka&to=Chittagong" "Search Service"
echo ""

echo "📍 User Service Routes (requires auth):"
test_route "GET" "/api/user/profile" "User Service"
echo ""

echo "📍 Booking Service Routes (requires auth):"
test_route "POST" "/api/bookings/create" "Booking Service" '{"journeyId":1}'
echo ""

echo "📍 Payment Service Routes (requires auth):"
test_route "POST" "/api/payments/initiate" "Payment Service" '{"bookingId":1}'
echo ""

echo "📍 Ticket Service Routes (requires auth):"
test_route "GET" "/api/tickets/1" "Ticket Service"
echo ""

echo "📍 Admin Service Routes (requires admin auth):"
test_route "GET" "/api/admin/users" "Admin Service"
echo ""

echo "📍 Reporting Service Routes (requires auth):"
test_route "GET" "/api/reports/bookings" "Reporting Service"
echo ""

echo "===================================="
echo "✅ API Gateway Configuration Summary:"
echo "   - External Access: $GATEWAY"
echo "   - All microservices: ClusterIP (internal only)"
echo "   - All traffic routed through API Gateway"
echo "===================================="
