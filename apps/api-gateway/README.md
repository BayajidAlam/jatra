# Jatra API Gateway

## Overview

The API Gateway is the single entry point for all client requests in the Jatra Railway Ticketing System. Built with Go and Gin framework for high performance and low latency.

## Features

- ✅ **JWT Authentication** - Validates access tokens for protected routes
- ✅ **Request Routing** - Routes requests to appropriate microservices
- ✅ **Rate Limiting** - IP-based rate limiting to prevent abuse
- ✅ **CORS Support** - Cross-Origin Resource Sharing configuration
- ✅ **Request Logging** - Logs all requests with latency metrics
- ✅ **Error Handling** - Graceful error handling and responses
- ✅ **Health Checks** - Health endpoint for monitoring

## Architecture

```
Client → API Gateway (Port 3000) → Microservices
                                   ├─ Auth Service (3001)
                                   ├─ Schedule Service (3002)
                                   ├─ Seat Reservation (3003)
                                   ├─ Payment Service (3004)
                                   ├─ Booking Service (3005)
                                   ├─ Ticket Service (3006)
                                   └─ Notification (3007)
```

## Getting Started

### Prerequisites

- Go 1.21 or higher
- All backend services running

### Installation

```bash
cd apps/api-gateway

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Run the gateway
go run main.go
```

### Running with Docker

```bash
# Build image
docker build -t jatra-api-gateway .

# Run container
docker run -p 3000:3000 --env-file .env jatra-api-gateway
```

## Configuration

Configure via `.env` file:

```env
PORT=3000
GIN_MODE=debug

# JWT Secrets (must match auth-service)
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
SCHEDULE_SERVICE_URL=http://localhost:3002
# ... other services

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60
```

## API Routes

### Public Routes (No Authentication)

#### Auth

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token

#### Schedule (Read)

- `GET /api/trains` - List all trains
- `GET /api/trains/:id` - Get train details
- `GET /api/stations` - List all stations
- `GET /api/routes` - List all routes
- `GET /api/journeys/search` - Search journeys

#### Payment Webhook

- `POST /api/gateway/webhook` - Payment gateway callback

### Protected Routes (Requires JWT)

#### User

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `POST /api/auth/logout` - Logout user

#### Bookings

- `POST /api/bookings/create` - Create booking
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/confirm` - Confirm booking
- `POST /api/bookings/:id/cancel` - Cancel booking

#### Seat Locks

- `POST /api/locks/acquire` - Lock seats
- `GET /api/locks/availability` - Check availability
- `POST /api/locks/extend` - Extend lock TTL
- `DELETE /api/locks/:lockId` - Release lock

#### Payments

- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/refund` - Process refund

#### Tickets

- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/:id/pdf` - Download PDF ticket
- `POST /api/tickets/:id/validate` - Validate ticket

## Authentication

### JWT Token

Include JWT token in Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

The gateway validates tokens and forwards user context to services via headers:

- `X-User-ID` - User ID from JWT
- `X-User-Email` - User email
- `X-User-Role` - User role

### Example Request

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Use token for protected route
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

## Rate Limiting

- Default: 100 requests per 60 seconds per IP
- Returns HTTP 429 when limit exceeded
- Configurable via environment variables

## Health Check

```bash
curl http://localhost:3000/health

# Response
{
  "status": "healthy",
  "service": "api-gateway"
}
```

## Development

### Project Structure

```
api-gateway/
├── main.go              # Entry point
├── config/
│   └── config.go        # Configuration loader
├── middleware/
│   ├── auth.go          # JWT authentication
│   ├── ratelimit.go     # Rate limiting
│   └── logger.go        # Request logging
├── proxy/
│   └── proxy.go         # Request proxying logic
├── routes/
│   └── routes.go        # Route definitions
├── go.mod               # Go dependencies
├── Dockerfile           # Container image
└── .env.example         # Environment template
```

### Adding New Routes

1. Update `routes/routes.go`
2. Add route with appropriate middleware
3. Use `proxy.ProxyRequest()` to forward to service

Example:

```go
api.GET("/new-endpoint", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ServiceURL))
```

## Monitoring

### Request Logs

All requests are logged with:

- HTTP method and path
- Status code
- Latency
- Client IP

Example log:

```
[GET] /api/trains HTTP/1.1 | Status: 200 | Latency: 45ms | IP: 127.0.0.1
```

## Security

- ✅ JWT token validation
- ✅ Rate limiting per IP
- ✅ CORS configuration
- ✅ Request timeout (30 seconds)
- ✅ Secure headers

## Performance

- Written in Go for high performance
- Concurrent request handling
- Connection pooling
- Minimal memory footprint

## Troubleshooting

### Service Unavailable Error

**Issue**: `{"error": "Service unavailable", "service": "service-name"}`

**Solution**: Ensure the target service is running:

```bash
# Check if service is running
curl http://localhost:300X/health
```

### Token Validation Failed

**Issue**: `{"error": "Invalid or expired token"}`

**Solution**:

- Ensure JWT_ACCESS_SECRET matches auth-service
- Check token expiration
- Get new token via `/api/auth/login`

### Rate Limit Exceeded

**Issue**: `{"error": "Rate limit exceeded"}`

**Solution**: Wait for rate limit window to reset or increase limits in config

## Port

**Default**: 3000

All backend services are accessed through this single port.

## License

Part of Jatra Railway Ticketing System
