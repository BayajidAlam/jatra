#!/bin/bash

# Port cleanup function
cleanup_ports() {
    echo "Cleaning up ports (3000-3011, 30000)..."
    for port in {3000..3011} 30000; do
        pid=$(lsof -t -i:$port)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null
        fi
    done
}

cleanup_ports

# Directory for logs
mkdir -p logs

echo "Starting services..."

# Start Backend Services
cd apps/auth-service && pnpm start:dev > ../../logs/auth.log 2>&1 &
echo "Started Auth Service"

cd apps/user-service && pnpm start:dev > ../../logs/user.log 2>&1 &
echo "Started User Service"

cd apps/admin-service && pnpm start:dev > ../../logs/admin.log 2>&1 &
echo "Started Admin Service"

cd apps/search-service && pnpm start:dev > ../../logs/search.log 2>&1 &
echo "Started Search Service"

cd apps/booking-service && pnpm start:dev > ../../logs/booking.log 2>&1 &
echo "Started Booking Service"

cd apps/payment-service && pnpm start:dev > ../../logs/payment.log 2>&1 &
echo "Started Payment Service"

cd apps/seat-reservation-service && pnpm start:dev > ../../logs/seat.log 2>&1 &
echo "Started Seat Reservation Service"

cd apps/notification-service && pnpm start:dev > ../../logs/notification.log 2>&1 &
echo "Started Notification Service"

cd apps/schedule-service && pnpm start:dev > ../../logs/schedule.log 2>&1 &
echo "Started Schedule Service"

cd apps/reporting-service && pnpm start:dev > ../../logs/reporting.log 2>&1 &
echo "Started Reporting Service"

cd apps/ticket-service && pnpm start:dev > ../../logs/ticket.log 2>&1 &
echo "Started Ticket Service"

# Start API Gateway
cd apps/api-gateway && go run main.go > ../../logs/gateway.log 2>&1 &
echo "Started API Gateway"

# Start Web (Frontend)
cd apps/web && pnpm dev > ../../logs/web.log 2>&1 &
echo "Started Web Frontend"

echo "All services started. Logs are in the logs/ directory."
echo "Wait a few seconds for them to initialize..."
