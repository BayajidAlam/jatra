# Running All Services

## Quick Start

### Option 1: Using tmux (Recommended)

```bash
# Install tmux if not already installed
sudo apt-get install tmux

# Start all services in one tmux session
./start-all-tmux.sh

# Navigate between windows:
# Ctrl+b then 0-6 (to switch between services)
# Ctrl+b then d (to detach and leave running)

# To reattach later:
tmux attach -t jatra-railway

# To stop all services:
tmux kill-session -t jatra-railway
```

### Option 2: Manual (Multiple Terminals)

Open 7 terminal windows and run:

**Terminal 1 - Auth Service:**

```bash
cd apps/auth-service
pnpm start:dev
```

**Terminal 2 - Schedule Service:**

```bash
cd apps/schedule-service
pnpm start:dev
```

**Terminal 3 - Seat Reservation Service:**

```bash
cd apps/seat-reservation-service
pnpm start:dev
```

**Terminal 4 - Payment Service:**

```bash
cd apps/payment-service
pnpm start:dev
```

**Terminal 5 - Booking Service:**

```bash
cd apps/booking-service
pnpm start:dev
```

**Terminal 6 - Ticket Service:**

```bash
cd apps/ticket-service
pnpm start:dev
```

**Terminal 7 - Notification Service:**

```bash
cd apps/notification-service
pnpm start:dev
```

**Terminal 8 - API Gateway:**

```bash
cd apps/api-gateway
./api-gateway
# Or use: ./start.sh (runs in background)
```

## Service URLs

| Service          | Port     | URL                       | API Docs                                |
| ---------------- | -------- | ------------------------- | --------------------------------------- |
| **API Gateway**  | **3000** | **http://localhost:3000** | **Single entry point for all services** |
| Auth             | 3001     | http://localhost:3001     | http://localhost:3001/api/docs          |
| Schedule         | 3002     | http://localhost:3002     | http://localhost:3002/api/docs          |
| Seat Reservation | 3003     | http://localhost:3003     | http://localhost:3003/api/docs          |
| Payment          | 3004     | http://localhost:3004     | http://localhost:3004/api/docs          |
| Booking          | 3005     | http://localhost:3005     | http://localhost:3005/api/docs          |
| Ticket           | 3006     | http://localhost:3006     | http://localhost:3006/api/docs          |
| Notification     | 3007     | http://localhost:3007     | http://localhost:3007/api/docs          |

## External Services

- **RabbitMQ Management:** http://localhost:15672 (guest/guest)
- **PostgreSQL:** localhost:5432 (jatra_user/jatra_password)

## API Gateway

**All client requests should now go through the API Gateway at port 3000:**

```bash
# Public routes (no auth)
curl http://localhost:3000/api/auth/login
curl http://localhost:3000/api/trains
curl http://localhost:3000/api/journeys/search

# Protected routes (requires JWT token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/bookings
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/me

# Health check
curl http://localhost:3000/health
```

**Features:**

- JWT authentication for protected routes
- Rate limiting (100 req/60sec per IP)
- Request logging with latency
- User context propagation to services
- CORS support

## Prerequisites

1. **Docker Services Running:**

   ```bash
   docker ps  # Should show jatra-postgres and rabbitmq
   ```

2. **Database Setup:**

   ```bash
   # Generate Prisma client
   pnpm prisma:generate

   # Run migrations (if needed)
   cd libs/database/prisma
   npx prisma migrate dev

   # Seed database (optional)
   pnpm db:seed
   ```

3. **Environment Variables:**
   - All `.env` files are configured in each service
   - Using shared database: `jatra_db`
   - Database credentials: `jatra_user` / `jatra_password`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001  # Replace with your port

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec jatra-postgres psql -U jatra_user -d jatra_db -c "SELECT 1;"
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Restart RabbitMQ
docker restart <rabbitmq-container-id>
```

### Clear All Running Services

```bash
# Kill all ts-node-dev processes
pkill -f ts-node-dev

# Or use the stop script
./stop-all.sh
```

## Development Workflow

1. Start all services: `./start-all-tmux.sh`
2. Make code changes (services auto-reload with ts-node-dev)
3. Test APIs using the Swagger docs at `/api/docs`
4. Check logs in tmux windows
5. Stop services: `tmux kill-session -t jatra-railway`

## Testing the Complete Flow

```bash
# Run the test script
./test-booking-flow.sh

# Or test manually with curl:
# 1. Register user
curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d '{...}'

# 2. Create booking
curl -X POST http://localhost:3005/bookings -H "Content-Type: application/json" -d '{...}'

# 3. Check RabbitMQ events
# Visit http://localhost:15672 and check queues
```
