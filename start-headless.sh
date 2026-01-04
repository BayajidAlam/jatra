#!/bin/bash

# Function to start a service in the background
start_service() {
    SERVICE_NAME=$1
    SERVICE_PORT=$2
    SERVICE_PATH=$3
    LOG_FILE=$4

    echo "Starting $SERVICE_NAME on port $SERVICE_PORT..."
    cd "$SERVICE_PATH"
    nohup pnpm start:dev > "$LOG_FILE" 2>&1 &
    PID=$!
    echo "$SERVICE_NAME started with PID $PID. Logs: $LOG_FILE"
    cd - > /dev/null
}

mkdir -p logs

# Start API Gateway (Go)
echo "Starting API Gateway (Port: 30000)"
cd apps/api-gateway
nohup go run main.go > ../../logs/api-gateway.log 2>&1 &
echo "API Gateway started with PID $!. Logs: logs/api-gateway.log"
cd - > /dev/null
sleep 2

# Start NestJS Microservices
start_service "Auth Service" "3001" "apps/auth-service" "$(pwd)/logs/auth-service.log"
start_service "Schedule Service" "3002" "apps/schedule-service" "$(pwd)/logs/schedule-service.log"
start_service "Seat Reservation" "3003" "apps/seat-reservation-service" "$(pwd)/logs/seat-reservation-service.log"
start_service "Payment Service" "3004" "apps/payment-service" "$(pwd)/logs/payment-service.log"
start_service "Booking Service" "3005" "apps/booking-service" "$(pwd)/logs/booking-service.log"
start_service "Ticket Service" "3006" "apps/ticket-service" "$(pwd)/logs/ticket-service.log"
start_service "Notification Service" "3007" "apps/notification-service" "$(pwd)/logs/notification-service.log"
start_service "User Service" "3008" "apps/user-service" "$(pwd)/logs/user-service.log"
start_service "Search Service" "3009" "apps/search-service" "$(pwd)/logs/search-service.log"
start_service "Admin Service" "3010" "apps/admin-service" "$(pwd)/logs/admin-service.log"
start_service "Reporting Service" "3011" "apps/reporting-service" "$(pwd)/logs/reporting-service.log"

# Start Frontend
echo "Starting Frontend on port 3000..."
cd apps/web
nohup pnpm dev > ../../logs/web.log 2>&1 &
echo "Frontend started with PID $!. Logs: logs/web.log"
cd - > /dev/null

echo "All services command issued."
