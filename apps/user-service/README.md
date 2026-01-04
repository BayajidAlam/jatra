# User Service

User profile management service for Jatra Railway system.

## Features

- **User Profiles**: Complete profile management with personal details
- **Saved Passengers**: Store frequently used passenger information
- **Preferences**: User preferences for travel, notifications, and UI
- **Travel History**: View booking history and statistics
- **Profile Images**: Support for profile picture uploads

## API Endpoints

### Profile Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Deactivate account

### Saved Passengers
- `GET /api/users/passengers` - List saved passengers
- `POST /api/users/passengers` - Add new passenger
- `PUT /api/users/passengers/:id` - Update passenger details
- `DELETE /api/users/passengers/:id` - Remove passenger

### Preferences
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences

### Travel History
- `GET /api/users/travel-history` - Get booking history with stats

## Running the Service

```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## Environment Variables

- `PORT` - Service port (default: 3008)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret for auth verification

## Port

3008
# CI/CD Pipeline test Thu Dec 11 12:43:51 AM +06 2025
