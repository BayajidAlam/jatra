# Shared Libraries

This directory contains shared libraries used across all microservices.

## Libraries

### 📦 Common Libraries

#### `@jatra/common/interfaces`

- User, Train, Booking, Ticket, Payment interfaces
- Enums for statuses and types

#### `@jatra/common/types`

- API response types
- Pagination types
- Notification types

#### `@jatra/common/dtos`

- Data Transfer Objects for validation
- Auth, Booking, Search, Seat DTOs
- **Note**: Requires `class-validator` and `class-transformer` in services

#### `@jatra/common/constants`

- Redis key patterns and TTLs
- Application configuration
- Event names and queue names

#### `@jatra/common/utils`

- Date utilities
- Hash utilities (bcrypt placeholders)
- Random generation utilities

### 🔧 Utility Libraries

#### `@jatra/sms`

- SMS service wrapper
- Supports: SSL Wireless, BulkSMS Bangladesh, Twilio
- Phone number validation and formatting

#### `@jatra/qr-code`

- QR code generation for tickets
- HMAC signature for validation
- **Note**: Requires `qrcode` package in services

### 🗄️ Infrastructure Libraries (Coming Soon)

#### `@jatra/database/postgres`

- PostgreSQL connection utilities
- TypeORM/Prisma helpers

#### `@jatra/database/redis`

- Redis connection and utilities
- Caching helpers

#### `@jatra/messaging/rabbitmq`

- RabbitMQ connection and publishing
- Event handling

#### `@jatra/telemetry/opentelemetry`

- Distributed tracing setup
- Instrumentation helpers

## Usage

Import shared libraries in your services:

```typescript
// Interfaces
import { User, Train, Booking } from "@jatra/common/interfaces";

// Types
import { ApiResponse, PaginatedResponse } from "@jatra/common/types";

// Constants
import { REDIS_KEYS, EVENTS, APP_CONFIG } from "@jatra/common/constants";

// Utils
import { DateUtil, HashUtil, RandomUtil } from "@jatra/common/utils";

// SMS Service
import { SMSService } from "@jatra/sms";

// QR Code Service
import { QRCodeService } from "@jatra/qr-code";
```

## Implementation Notes

Some libraries contain placeholder implementations that will be replaced with actual implementations in the services:

- **Hash utilities**: Currently use simple placeholders. Services will implement actual bcrypt hashing.
- **QR Code service**: Contains TODO comments for actual qrcode package integration.
- **DTOs**: Use class-validator decorators that will be active when the package is installed in services.

## Development

When implementing a service that uses these libraries:

1. Install required dependencies in the service's `package.json`
2. Import the needed libraries using the `@jatra/*` import paths
3. TypeScript path mapping is configured in `tsconfig.base.json`

## Dependencies Required in Services

When using these libraries, services may need to install:

```bash
# For DTOs
npm install class-validator class-transformer

# For QR codes
npm install qrcode @types/qrcode

# For hashing
npm install bcrypt @types/bcrypt

# For Node.js types
npm install -D @types/node
```
