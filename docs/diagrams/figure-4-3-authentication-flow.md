# Figure 4.3 — Authentication & Authorization Flow

Description

- JWT-based authentication flow showing registration, login, and protected resource access.

Mermaid diagram

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant Web as Web Frontend
  participant Auth as AuthService
  participant DB as PostgreSQL
  participant Service as Protected Service

  %% Registration Flow
  rect rgb(200, 220, 240)
    Note over U,DB: Registration Flow
    U->>Web: Fill registration form
    Web->>Auth: POST /auth/register {email, password, phone}
    Auth->>DB: Check if user exists
    alt user exists
      DB-->>Auth: User found
      Auth-->>Web: 409 Conflict
    else new user
      DB-->>Auth: No user
      Auth->>Auth: Hash password (bcrypt)
      Auth->>DB: INSERT user
      DB-->>Auth: User created
      Auth->>Auth: Generate JWT (accessToken, refreshToken)
      Auth-->>Web: 201 {user, accessToken, refreshToken}
      Web->>Web: Store tokens (localStorage/cookie)
      Web-->>U: Redirect to dashboard
    end
  end

  %% Login Flow
  rect rgb(220, 240, 200)
    Note over U,DB: Login Flow
    U->>Web: Enter credentials
    Web->>Auth: POST /auth/login {email, password}
    Auth->>DB: SELECT user WHERE email
    DB-->>Auth: User data
    Auth->>Auth: Verify password (bcrypt.compare)
    alt password valid
      Auth->>Auth: Generate JWT tokens
      Auth-->>Web: 200 {user, accessToken, refreshToken}
      Web->>Web: Store tokens
      Web-->>U: Redirect to dashboard
    else invalid
      Auth-->>Web: 401 Unauthorized
      Web-->>U: Show error
    end
  end

  %% Protected Resource Access
  rect rgb(240, 220, 200)
    Note over U,Service: Protected Resource Access
    U->>Web: Request protected resource
    Web->>Service: GET /resource (Authorization: Bearer {token})
    Service->>Service: Verify JWT signature & expiry
    alt token valid
      Service->>DB: Fetch resource
      DB-->>Service: Resource data
      Service-->>Web: 200 {data}
      Web-->>U: Display data
    else token expired
      Service-->>Web: 401 Token expired
      Web->>Auth: POST /auth/refresh {refreshToken}
      Auth->>Auth: Verify refresh token
      Auth-->>Web: 200 {new accessToken}
      Web->>Service: Retry with new token
    end
  end
```

Notes

- Access tokens expire in 15 minutes; refresh tokens in 7 days.
- Password hashing uses bcrypt with 10 rounds.
- JWT payload includes: userId, email, role, exp, iat.
