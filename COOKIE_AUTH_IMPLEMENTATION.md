# Cookie-Based Authentication Implementation

## Overview
Implemented HttpOnly cookie-based authentication to improve security over token-in-body approach.

## Changes Made

### 1. Auth Service (`apps/auth-service`)

#### Dependencies Added:
```bash
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

#### Files Modified:

**`src/main.ts`:**
- Added `cookie-parser` middleware
- Updated CORS configuration to allow credentials
- Added `FRONTEND_URL` environment variable support

**`src/auth/auth.controller.ts`:**
- Imported `Request` and `Response` from Express
- Updated all endpoints to use cookies:
  - `POST /auth/register` - Sets accessToken and refreshToken cookies
  - `POST /auth/login` - Sets accessToken and refreshToken cookies  
  - `POST /auth/refresh-token` - Reads refreshToken from cookie, sets new cookies
  - `POST /auth/logout` - Clears both cookies
- Added helper methods:
  - `setCookies()` - Sets HttpOnly cookies with appropriate security flags
  - `clearCookies()` - Clears authentication cookies

**`.env`:**
- Added `FRONTEND_URL="http://localhost:3000"` for CORS

#### Cookie Configuration:
```typescript
{
  httpOnly: true,              // Prevents JavaScript access (XSS protection)
  secure: isProduction,        // HTTPS only in production
  sameSite: "strict",          // CSRF protection
  maxAge: 15 * 60 * 1000      // 15 minutes for access token
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days for refresh token
}
```

### 2. API Gateway (`apps/api-gateway`)

#### Files Modified:

**`middleware/auth.go`:**
- Updated `JWTAuth()` middleware to:
  1. Check for `accessToken` cookie first
  2. Fallback to `Authorization` header (backwards compatibility)
  3. Parse and validate JWT from either source
  4. Set user context (userId, email, role) for downstream services

## Security Benefits

### 1. **HttpOnly Cookies**
- JavaScript cannot access tokens (XSS protection)
- Tokens never exposed to client-side code
- Automatic browser security handling

### 2. **Secure Flag**  
- Cookies only sent over HTTPS in production
- Prevents man-in-the-middle attacks

### 3. **SameSite Attribute**
- Set to "strict" to prevent CSRF attacks
- Browser won't send cookies with cross-site requests

### 4. **Automatic Handling**
- Browser automatically includes cookies in requests
- No manual token management needed in frontend
- Reduces risk of token leakage

## API Changes

### Before (Token in Response Body):
```json
POST /auth/login
Response:
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { ... }
}
```

### After (Token in Cookie):
```json
POST /auth/login
Response:
{
  "user": { ... },
  "message": "Login successful"
}
Cookies:
  accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict
  refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict
```

## Backwards Compatibility

The API Gateway still accepts tokens via `Authorization` header:
```
Authorization: Bearer <token>
```

This ensures:
- Existing integrations continue to work
- Mobile apps can still use header-based auth
- Gradual migration possible

## Testing Instructions

### 1. Start Services:
```bash
# Start infrastructure
docker-compose up -d

# Start auth service
cd apps/auth-service && npm run start:dev

# Start API Gateway (in another terminal)
cd apps/api-gateway && go run main.go
```

### 2. Test Login with cURL:
```bash
# Login and save cookies
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Use cookies for authenticated request
curl -X GET http://localhost:3001/users/me \
  -b cookies.txt
```

### 3. Test via API Gateway:
```bash
# Login through gateway
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Access protected route with cookies
curl -X GET http://localhost:3000/api/users/me \
  -b cookies.txt
```

### 4. Test Refresh Token:
```bash
# Refresh access token (uses refreshToken cookie automatically)
curl -X POST http://localhost:3001/auth/refresh-token \
  -b cookies.txt \
  -c cookies.txt
```

### 5. Test Logout:
```bash
# Logout (clears cookies)
curl -X POST http://localhost:3001/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

## Frontend Integration

### React/Next.js Example:
```typescript
// Login
const login = async (identifier: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: sends cookies
    body: JSON.stringify({ identifier, password })
  });
  
  const data = await response.json();
  return data.user;
};

// Authenticated request
const getProfile = async () => {
  const response = await fetch('http://localhost:3000/api/users/me', {
    credentials: 'include' // Important: sends cookies
  });
  
  return response.json();
};

// Logout
const logout = async () => {
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
};
```

### Axios Configuration:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // Important: sends cookies
});

// Usage
await api.post('/auth/login', { identifier, password });
await api.get('/users/me');
await api.post('/auth/logout');
```

## Environment Variables

### Auth Service (`.env`):
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://jatra_user:jatra_password@localhost:5432/jatra_db
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### API Gateway (`.env`):
```env
PORT=3000
GIN_MODE=debug
JWT_ACCESS_SECRET=your-access-token-secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization

# Services
AUTH_SERVICE_URL=http://localhost:3001
SCHEDULE_SERVICE_URL=http://localhost:3002
# ... other services
```

## Production Considerations

### 1. Enable Secure Flag:
Set `NODE_ENV=production` to enable secure flag on cookies (HTTPS only).

### 2. Configure Domain:
For subdomains, set cookie domain:
```typescript
response.cookie('accessToken', token, {
  domain: '.yourdomain.com', // Allows api.yourdomain.com and app.yourdomain.com
  // ... other options
});
```

### 3. Update CORS:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true
});
```

### 4. HTTPS Required:
Cookies with `secure: true` only work over HTTPS in production.

## Migration Path

### Phase 1: Implement (Current)
- ✅ Add cookie support to auth service
- ✅ Update API Gateway to read cookies
- ✅ Maintain backwards compatibility with header auth

### Phase 2: Frontend Update (Next)
- Update web app to use `credentials: 'include'`
- Remove manual token storage (localStorage)
- Test cookie flow end-to-end

### Phase 3: Deprecation (Future)
- Add warnings for header-based auth
- Set timeline for header auth removal
- Update documentation

## Troubleshooting

### Issue: Cookies not being set
- Check CORS `credentials: true` enabled
- Verify frontend uses `credentials: 'include'`
- Check browser devtools → Application → Cookies

### Issue: Cookies not sent with requests
- Ensure `credentials: 'include'` in fetch/axios
- Check SameSite policy
- Verify domain matches

### Issue: 401 Unauthorized
- Check cookie expiration
- Verify JWT secret matches across services
- Check cookie name matches what Gateway expects

## References

- [OWASP: HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [SameSite Cookies Explained](https://web.dev/samesite-cookies-explained/)

---

**Date**: December 8, 2025  
**Branch**: `feature/cookie-auth`  
**Status**: ✅ Implementation Complete - Ready for Testing
