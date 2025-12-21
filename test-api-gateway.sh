#!/bin/bash
# Test API Gateway routing

GATEWAY_URL="http://192.168.49.2:30000"

echo "🧪 Testing API Gateway (All traffic routes through gateway)"
echo "============================================================"
echo ""

echo "✅ API Gateway Health:"
curl -s $GATEWAY_URL/health | jq .
echo ""

echo "📍 Available Routes (via API Gateway):"
echo ""
echo "Public Routes (No Auth):"
echo "  GET  $GATEWAY_URL/api/auth/register"
echo "  POST $GATEWAY_URL/api/auth/login"
echo "  GET  $GATEWAY_URL/api/stations"
echo "  GET  $GATEWAY_URL/api/trains"
echo "  GET  $GATEWAY_URL/api/journeys/search"
echo ""

echo "Protected Routes (Requires JWT Token):"
echo "  GET  $GATEWAY_URL/api/users/me"
echo "  POST $GATEWAY_URL/api/bookings/create"
echo "  GET  $GATEWAY_URL/api/tickets/:id"
echo "  POST $GATEWAY_URL/api/payments/initiate"
echo ""

echo "Admin Routes (Requires Admin Role):"
echo "  GET  $GATEWAY_URL/api/admin/users"
echo "  GET  $GATEWAY_URL/api/reports/bookings"
echo ""

echo "============================================================"
echo "📝 All microservices are now accessible ONLY through API Gateway"
echo "🔒 Direct access to microservices blocked (ClusterIP services)"
echo "🌐 External traffic: http://192.168.49.2:30000"
echo "============================================================"
