#!/bin/bash
# Rollback script - reverts to direct PostgreSQL connections if needed

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Rolling back to direct PostgreSQL connections...${NC}\n"

# Backup current secret
kubectl get secret postgres-secret -n jatra -o yaml > /tmp/postgres-secret-pgbouncer-backup.yaml

# Create secret with direct postgres connections
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: jatra
type: Opaque
stringData:
  postgres-password: "jatra_password_change_in_prod"
  auth-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/auth_db"
  schedule-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/schedule_db"
  seat-reservation-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/seat_reservation_db"
  payment-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/payment_db"
  booking-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/booking_db"
  ticket-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/ticket_db"
  notification-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/notification_db"
  user-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/user_db"
  search-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/search_db"
  admin-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/admin_db"
  reporting-db-url: "postgresql://jatra_user:jatra_password_change_in_prod@postgres-service:5432/reporting_db"
EOF

echo -e "${GREEN}✓ Secrets reverted to direct PostgreSQL${NC}\n"

# Restart services
echo -e "${YELLOW}Restarting services...${NC}"
services=(
    "auth-service" "booking-service" "payment-service" 
    "seat-reservation-service" "schedule-service" "ticket-service"
    "notification-service" "user-service" "admin-service"
    "search-service" "reporting-service"
)

for service in "${services[@]}"; do
    kubectl rollout restart deployment/${service} -n jatra
done

echo -e "${GREEN}✓ Services restarted${NC}\n"
echo -e "${YELLOW}Note: PgBouncer and HPA are still running. To remove them:${NC}"
echo "  kubectl delete -f infra/kubernetes/deployments/pgbouncer.yaml"
echo "  kubectl delete -f infra/kubernetes/hpa/all-services-hpa.yaml"
