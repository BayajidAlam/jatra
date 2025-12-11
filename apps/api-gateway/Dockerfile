# Stage 1: Build
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod files from api-gateway directory
COPY apps/api-gateway/go.mod apps/api-gateway/go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code from api-gateway directory
COPY apps/api-gateway ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway .

# Stage 2: Run
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/api-gateway .

# Expose port
EXPOSE 3000

# Run
CMD ["./api-gateway"]
