#!/bin/bash

# Jatra Railway - Start All Services

echo "🚀 Starting Jatra Railway Services..."

# Function to run a service in a new terminal tab/window if possible, or background
start_service() {
    name=$1
    path=$2
    cmd=$3
    port=$4

    echo "▶️  Starting $name ($port)..."
    
    # Check if gnome-terminal is available (common on Linux)
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="$name" -- bash -c "cd $path && $cmd; exec bash"
    else
        # Fallback to background process
        (cd $path && $cmd) &
        echo "   Started in background (PID: $!)"
    fi
}

# 1. API Gateway (Go)
start_service "API Gateway" "apps/api-gateway" "go run main.go" "3000"

# 2. Auth Service
start_service "Auth Service" "apps/auth-service" "pnpm dev" "3001"

# 3. Schedule Service
start_service "Schedule Service" "apps/schedule-service" "pnpm dev" "3002"

# 4. Seat Reservation Service
start_service "Seat Service" "apps/seat-reservation-service" "pnpm dev" "3003"

# 5. Payment Service
start_service "Payment Service" "apps/payment-service" "pnpm dev" "3004"

# 6. Booking Service
start_service "Booking Service" "apps/booking-service" "pnpm dev" "3005"

# 7. Ticket Service
start_service "Ticket Service" "apps/ticket-service" "pnpm dev" "3006"

# 8. Notification Service
start_service "Notification Service" "apps/notification-service" "pnpm dev" "3007"

# 9. Search Service
start_service "Search Service" "apps/search-service" "pnpm dev" "3008"

# 10. Reporting Service
start_service "Reporting Service" "apps/reporting-service" "pnpm dev" "3009"

# 11. User Service
start_service "User Service" "apps/user-service" "pnpm dev" "3010"

# 12. Admin Service
start_service "Admin Service" "apps/admin-service" "pnpm dev" "3011"

# 13. Web Frontend
start_service "Web Frontend" "apps/web" "pnpm dev" "3012" # Assuming port, check next.config

echo "✅ All services initiated!"
