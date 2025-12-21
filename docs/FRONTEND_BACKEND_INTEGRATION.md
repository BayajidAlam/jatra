# Frontend-Backend Integration Guide

## Authentication Flow

### How Backend Handles Authentication

The `auth-service` uses **HttpOnly cookies** for secure token storage. Tokens are **NOT sent in response body** - they are automatically set as cookies by the server.

### Cookie-Based Token Storage

**Access Token**:

- Cookie name: `accessToken`
- Expiry: 15 minutes
- HttpOnly: `true` (JavaScript cannot access)
- Secure: `true` (production only, HTTPS)
- SameSite: `strict`

**Refresh Token**:

- Cookie name: `refreshToken`
- Expiry: 7 days
- HttpOnly: `true`
- Secure: `true` (production)
- SameSite: `strict`

### API Endpoints

#### 1. Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "nid": "1234567890123",      // 13 digits
  "email": "user@example.com",
  "phone": "01712345678",       // BD format
  "name": "John Doe",
  "password": "SecurePass123"   // Min 8 chars
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "message": "Registration successful"
}

Cookies Set:
- accessToken (15 min)
- refreshToken (7 days)
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",  // Email, NID, or Phone
  "password": "SecurePass123"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "message": "Login successful"
}

Cookies Set:
- accessToken (15 min)
- refreshToken (7 days)
```

#### 3. Refresh Token

```http
POST /api/auth/refresh-token

No body required - reads refreshToken from cookie

Response: 200 OK
{
  "message": "Token refreshed successfully"
}

Cookies Updated:
- accessToken (new, 15 min)
- refreshToken (new, 7 days)
```

#### 4. Logout

```http
POST /api/auth/logout

No body required - reads refreshToken from cookie

Response: 200 OK
{
  "message": "Logged out successfully"
}

Cookies Cleared:
- accessToken
- refreshToken
```

## Frontend Implementation

### 1. Axios Configuration (CRITICAL)

```typescript
// src/lib/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://192.168.49.2:30000/api",
  withCredentials: true, // ← CRITICAL: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await apiClient.post("/auth/refresh-token");

        // Retry original request (new accessToken cookie now set)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 2. Auth Service

```typescript
// src/features/auth/services/auth.service.ts
import { apiClient } from "@/lib/api/client";

export const authService = {
  async register(data: RegisterDto) {
    const response = await apiClient.post("/auth/register", data);
    return response.data; // Returns { user, message }
  },

  async login(credentials: LoginDto) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data; // Returns { user, message }
  },

  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  async getCurrentUser() {
    // Call any protected endpoint to verify auth
    const response = await apiClient.get("/users/profile");
    return response.data;
  },
};
```

### 3. Auth Hook

```typescript
// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user (will fail if no valid cookie)
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Cookies are automatically set by server
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
};
```

### 4. Protected API Calls

```typescript
// All protected endpoints automatically use cookies
const bookings = await apiClient.get("/bookings"); // accessToken sent automatically

const payment = await apiClient.post("/payments", {
  amount: 500,
}); // accessToken sent automatically
```

## Key Differences from localStorage Approach

| Aspect        | HttpOnly Cookies (Backend)    | localStorage (Frontend)         |
| ------------- | ----------------------------- | ------------------------------- |
| **Storage**   | Server sets cookies           | Frontend stores in localStorage |
| **Security**  | ✅ XSS-safe (JS can't access) | ❌ Vulnerable to XSS            |
| **CSRF**      | Need CSRF protection          | Not vulnerable                  |
| **Auto-send** | ✅ Sent automatically         | ❌ Must manually attach         |
| **Expiry**    | Server-controlled             | Frontend-controlled             |
| **Best for**  | Production apps               | Development/testing             |

## Important Notes

### ✅ DO:

- Always set `withCredentials: true` in Axios
- Handle 401 errors with automatic refresh
- Clear React Query cache on logout
- Use HTTPS in production

### ❌ DON'T:

- Try to access tokens in JavaScript (they're HttpOnly)
- Store tokens in localStorage/sessionStorage
- Manually set Authorization headers (cookies handle this)
- Send tokens in request body

## CORS Configuration

Your API Gateway must allow credentials:

```typescript
// API Gateway CORS settings (already configured)
{
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true,                 // ← CRITICAL
  allowedHeaders: ['Content-Type']
}
```

## Development vs Production

**Development** (localhost):

- `secure: false` - HTTP allowed
- `sameSite: 'lax'` - Cross-site requests allowed

**Production**:

- `secure: true` - HTTPS required
- `sameSite: 'strict'` - Same-site only

## Testing Authentication

```bash
# Register
curl -X POST http://192.168.49.2:30000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "nid": "1234567890123",
    "email": "test@example.com",
    "phone": "01712345678",
    "name": "Test User",
    "password": "password123"
  }'

# Use protected endpoint (cookies automatically sent)
curl -X GET http://192.168.49.2:30000/api/users/profile \
  -b cookies.txt

# Logout
curl -X POST http://192.168.49.2:30000/api/auth/logout \
  -b cookies.txt
```

## Summary

🔐 **Backend handles all token management** via HttpOnly cookies  
🚀 **Frontend just makes requests** - cookies sent automatically  
🔄 **Auto-refresh on 401** - seamless token renewal  
🛡️ **XSS-safe** - JavaScript cannot access tokens  
✅ **Production-ready** - secure by default
