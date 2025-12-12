#!/bin/bash
# Deployment script for all performance improvements
# This script deploys PgBouncer, HPA, updates secrets, and rebuilds API Gateway

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Jatra Railway - Performance Improvements Deployment${NC}"
echo -e "${GREEN}======================================${NC}\n"

# Check if minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${RED}Error: Minikube is not running. Please start minikube first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Deploying PgBouncer for connection pooling...${NC}"
kubectl apply -f infra/kubernetes/deployments/pgbouncer.yaml
echo -e "${GREEN}✓ PgBouncer deployed${NC}\n"

echo -e "${YELLOW}Step 2: Waiting for PgBouncer to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=pgbouncer -n jatra --timeout=120s
echo -e "${GREEN}✓ PgBouncer is ready${NC}\n"

echo -e "${YELLOW}Step 3: Updating database connection secrets to use PgBouncer...${NC}"
kubectl apply -f infra/kubernetes/secrets/postgres-secret.yaml
echo -e "${GREEN}✓ Secrets updated${NC}\n"

echo -e "${YELLOW}Step 4: Deploying HPA (Horizontal Pod Autoscaler) for all services...${NC}"
# Check if metrics-server is installed
if ! kubectl get deployment metrics-server -n kube-system &> /dev/null; then
    echo -e "${YELLOW}Metrics Server not found. Installing...${NC}"
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    # Patch metrics-server for minikube
    kubectl patch deployment metrics-server -n kube-system --type='json' \
        -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]' || true
    
    echo -e "${YELLOW}Waiting for metrics-server to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
fi

kubectl apply -f infra/kubernetes/hpa/all-services-hpa.yaml
echo -e "${GREEN}✓ HPA deployed for all services${NC}\n"

echo -e "${YELLOW}Step 5: Restarting services to pick up new PgBouncer connections...${NC}"
services=(
    "auth-service"
    "booking-service"
    "payment-service"
    "seat-reservation-service"
    "schedule-service"
    "ticket-service"
    "notification-service"
    "user-service"
    "admin-service"
    "search-service"
    "reporting-service"
)

for service in "${services[@]}"; do
    echo -e "  Restarting ${service}..."
    if ! kubectl rollout restart deployment/${service} -n jatra 2>/dev/null; then
        echo -e "    ${YELLOW}Deployment ${service} not found, skipping restart${NC}"
    fi
done
echo -e "${GREEN}✓ All services restarted${NC}\n"

echo -e "${YELLOW}Step 6: Building and deploying API Gateway with Circuit Breaker...${NC}"
docker build -f apps/api-gateway/Dockerfile -t jatra/api-gateway:1.2 .
minikube image load jatra/api-gateway:1.2

kubectl set image deployment/api-gateway api-gateway=jatra/api-gateway:1.2 -n jatra
kubectl rollout status deployment/api-gateway -n jatra --timeout=120s
echo -e "${GREEN}✓ API Gateway with circuit breaker deployed${NC}\n"

echo -e "${YELLOW}Step 7: Verifying deployments...${NC}"
echo ""
echo "PgBouncer Status:"
kubectl get pods -n jatra -l app=pgbouncer
echo ""
echo "HPA Status:"
kubectl get hpa -n jatra
echo ""
echo "Service Replicas:"
kubectl get deployments -n jatra -l app.kubernetes.io/part-of=jatra

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}\n"

echo -e "${YELLOW}Summary of Improvements Deployed:${NC}"
echo "  ✓ PgBouncer: Connection pooling (1000 clients → 100 DB connections)"
echo "  ✓ HPA: Auto-scaling for all services (2-20 replicas based on load)"
echo "  ✓ Circuit Breaker: Fail-fast protection in API Gateway"
echo "  ✓ Async Payment: Queue-based processing (non-blocking)"
echo "  ✓ Atomic Seat Locking: Lua scripts for race-free reservations"
echo "  ✓ Idempotency: Duplicate request prevention"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "  1. Monitor PgBouncer: kubectl logs -n jatra -l app=pgbouncer"
echo "  2. Watch HPA scaling: kubectl get hpa -n jatra --watch"
echo "  3. Check circuit breaker: kubectl logs -n jatra -l app=api-gateway | grep Circuit"
echo "  4. Run load tests to verify improvements"

echo -e "\n${YELLOW}Testing Commands:${NC}"
echo "  # Test booking endpoint (with idempotency)"
echo "  curl -X POST http://\$(minikube ip):30000/api/bookings/create \\"
echo "    -H 'Idempotency-Key: \$(uuidgen)' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{...}'"
echo ""
echo "  # Monitor PgBouncer stats"
echo "  kubectl exec -it -n jatra deploy/pgbouncer -- psql -p 5432 -U jatra_user pgbouncer -c 'SHOW POOLS;'"
echo ""
echo "  # Check HPA metrics"
echo "  kubectl top pods -n jatra"

echo -e "\n${GREEN}Deployment script completed successfully!${NC}"
