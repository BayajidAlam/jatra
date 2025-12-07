# Auth Service

Authentication service for Jatra Railway ticketing system.

## Features

- ✅ User registration with NID (Bangladesh National ID), email, phone, and password
- ✅ Login with NID, email, or phone
- ✅ JWT access and refresh tokens
- ✅ Token refresh mechanism
- ✅ Logout (token invalidation)
- ✅ Token verification endpoint
- ✅ Bangladesh-specific validation (NID: 10/13 digits, Phone: +880 or 01 format)

**Note:** User profile management (update, preferences, saved passengers, travel history) is handled by the User Service (port 3008)

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with passport-jwt
- **Validation:** class-validator

## API Endpoints

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "nid": "1234567890",
  "email": "user@example.com",
  "phone": "+8801712345678",
  "name": "John Doe",
  "password": "SecurePass123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "1234567890", // Can be NID, email, or phone
  "password": "SecurePass123"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Token Verification

#### Verify Token

```http
GET /users/verify-token
Authorization: Bearer <access-token>
```

Returns user information if token is valid. Used by other services to verify authentication.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your database URL and secrets

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
pnpm start:dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jatra_railway"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
```

## Validation Rules

### NID (National ID)

- Must be 10 or 13 digits
- Numeric only

### Phone

- Must match Bangladesh format
- Accepted formats: `+8801XXXXXXXXX` or `01XXXXXXXXX`
- Must start with +8801 or 01, followed by valid digit (3-9), then 8 more digits

### Password

- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

## Database Schema

```prisma
model User {
  id            String         @id @default(uuid())
  nid           String         @unique
  email         String         @unique
  phone         String         @unique
  passwordHash  String
  name          String
  role          Role           @default(USER)
  emailVerified Boolean        @default(false)
  phoneVerified Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(...)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

## Future Enhancements

- [ ] Email verification
- [ ] Phone OTP verification
- [ ] Password reset via email/SMS
- [ ] Two-factor authentication (2FA)
- [ ] Move refresh tokens to Redis for better performance
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
