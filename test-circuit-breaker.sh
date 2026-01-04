#!/bin/bash
# Test Circuit Breaker functionality

GATEWAY="http://192.168.49.2:30000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔬 Circuit Breaker Test"
echo "======================="
echo ""

# First, scale down schedule service to simulate failure
echo "${BLUE}Step 1: Simulating service failure...${NC}"
kubectl scale deployment schedule-service --replicas=0 -n jatra > /dev/null 2>&1
sleep 3

echo "${YELLOW}Making 6 requests to trigger circuit breaker (max 5 failures)${NC}"
echo ""

for i in {1..6}; do
  response=$(curl -s -w "\n%{http_code}" "$GATEWAY/api/trains" --max-time 3 2>&1)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [[ $body == *"Circuit breaker is open"* ]]; then
    echo "${RED}Request $i: Circuit OPEN - Service protected ✓${NC}"
  elif [[ $http_code == "500" ]] || [[ $http_code == "502" ]] || [[ $http_code == "503" ]]; then
    echo "${YELLOW}Request $i: HTTP $http_code - Failure recorded${NC}"
  else
    echo "${GREEN}Request $i: HTTP $http_code - Success${NC}"
  fi
  
  sleep 0.5
done

echo ""
echo "${BLUE}Step 2: Verifying circuit remains open...${NC}"
sleep 2

for i in {7..9}; do
  response=$(curl -s "$GATEWAY/api/trains" --max-time 2)
  if [[ $response == *"Circuit breaker is open"* ]]; then
    echo "${RED}Request $i: Circuit OPEN - Fast fail (no backend call) ✓${NC}"
  else
    echo "${GREEN}Request $i: Response received${NC}"
  fi
  sleep 1
done

echo ""
echo "${BLUE}Step 3: Restoring service...${NC}"
kubectl scale deployment schedule-service --replicas=1 -n jatra > /dev/null 2>&1
echo "Waiting for service to be ready..."
kubectl wait --for=condition=available deployment/schedule-service -n jatra --timeout=30s > /dev/null 2>&1

echo ""
echo "${BLUE}Step 4: Testing circuit recovery (half-open state)...${NC}"
echo "${YELLOW}Waiting for circuit to enter half-open state (10 seconds)...${NC}"
sleep 10

for i in {10..12}; do
  response=$(curl -s -w "\n%{http_code}" "$GATEWAY/api/trains" --max-time 3)
  http_code=$(echo "$response" | tail -n1)
  
  if [[ $http_code == "200" ]]; then
    echo "${GREEN}Request $i: HTTP $http_code - Circuit CLOSED (recovered) ✓${NC}"
  elif [[ $response == *"Circuit breaker is open"* ]]; then
    echo "${RED}Request $i: Circuit still OPEN${NC}"
  else
    echo "${YELLOW}Request $i: HTTP $http_code${NC}"
  fi
  sleep 2
done

echo ""
echo "======================="
echo "${GREEN}✅ Circuit Breaker Test Complete${NC}"
echo ""
echo "Summary:"
echo "- Circuit opens after 5 failures (prevents cascading failures)"
echo "- Fast-fail responses while open (protects backend)"
echo "- Half-open state after timeout (attempts recovery)"
echo "- Auto-closes when service recovers (resumes normal operation)"
