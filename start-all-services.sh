#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting all Jatra Railway Services...${NC}\n"

# Check if ports are free
echo -e "${BLUE}Checking for port conflicts...${NC}"
PORTS_IN_USE=$(lsof -i :3001 -i :3002 -i :3003 -i :3004 -i :3005 -i :3006 -i :3007 -i :3008 -i :3009 -i :3010 -i :3011 -i :30000 2>/dev/null | grep LISTEN)

if [ ! -z "$PORTS_IN_USE" ]; then
    echo -e "${RED}❌ Port conflict detected:${NC}"
    echo "$PORTS_IN_USE"
    echo -e "\n${RED}Please kill the processes or use different ports${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All ports are free!${NC}\n"

# Function to start a service in a new terminal
start_service() {
    SERVICE_NAME=$1
    SERVICE_PORT=$2
    SERVICE_PATH=$3
    
    echo -e "${GREEN}Starting $SERVICE_NAME on port $SERVICE_PORT...${NC}"
    
    # Use gnome-terminal, xterm, or tmux based on availability
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="$SERVICE_NAME" -- bash -c "cd $SERVICE_PATH && pnpm start:dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -T "$SERVICE_NAME" -e "cd $SERVICE_PATH && pnpm start:dev; bash" &
    elif command -v tmux &> /dev/null; then
        tmux new-window -n "$SERVICE_NAME" "cd $SERVICE_PATH && pnpm start:dev"
    else
        echo -e "${RED}No suitable terminal emulator found. Please install gnome-terminal, xterm, or tmux${NC}"
        exit 1
    fi
}

# Start API Gateway (Go)
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Starting API Gateway (Port: 30000)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
cd apps/api-gateway
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --tab --title="API Gateway" -- bash -c "cd $(pwd) && go run main.go; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -T "API Gateway" -e "cd $(pwd) && go run main.go; bash" &
elif command -v tmux &> /dev/null; then
    tmux new-window -n "API Gateway" "cd $(pwd) && go run main.go"
fi
cd ../..
sleep 2

# Start NestJS Microservices
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎫 Starting NestJS Microservices${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

start_service "Auth Service" "3001" "$(pwd)/apps/auth-service"
sleep 1

start_service "Schedule Service" "3002" "$(pwd)/apps/schedule-service"
sleep 1

start_service "Seat Reservation" "3003" "$(pwd)/apps/seat-reservation-service"
sleep 1

start_service "Payment Service" "3004" "$(pwd)/apps/payment-service"
sleep 1

start_service "Booking Service" "3005" "$(pwd)/apps/booking-service"
sleep 1

start_service "Ticket Service" "3006" "$(pwd)/apps/ticket-service"
sleep 1

start_service "Notification Service" "3007" "$(pwd)/apps/notification-service"
sleep 1

start_service "User Service" "3008" "$(pwd)/apps/user-service"
sleep 1

start_service "Search Service" "3009" "$(pwd)/apps/search-service"
sleep 1

start_service "Admin Service" "3010" "$(pwd)/apps/admin-service"
sleep 1

start_service "Reporting Service" "3011" "$(pwd)/apps/reporting-service"

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "\n${BLUE}📋 Service URLs:${NC}"
echo -e "${GREEN}🌐 API Gateway:        http://localhost:30000${NC}"
echo -e "🔐 Auth Service:       http://localhost:3001"
echo -e "🚂 Schedule Service:   http://localhost:3002"
echo -e "🔒 Seat Reservation:   http://localhost:3003"
echo -e "💳 Payment Service:    http://localhost:3004"
echo -e "📝 Booking Service:    http://localhost:3005"
echo -e "🎫 Ticket Service:     http://localhost:3006"
echo -e "📧 Notification:       http://localhost:3007"
echo -e "👤 User Service:       http://localhost:3008"
echo -e "🔍 Search Service:     http://localhost:3009"
echo -e "⚙️  Admin Service:      http://localhost:3010"
echo -e "📊 Reporting Service:  http://localhost:3011"

echo -e "\n${BLUE}💡 Tip: Each service is running in a separate terminal tab${NC}"
