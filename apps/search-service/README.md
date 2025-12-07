# Search Service

Optimized search service with Redis caching for Jatra Railway ticketing system.

## Features

- **Fast Train Search**: Redis-cached search results with 5-minute TTL
- **Popular Routes Caching**: Pre-cache frequently searched routes (1-hour TTL)
- **Station Autocomplete**: Instant station name suggestions
- **Search Analytics**: Track popular searches and routes
- **Cache Invalidation**: Smart cache updates when schedules change

## Technology Stack

- NestJS with TypeScript
- Redis for caching
- PostgreSQL for persistent data
- Swagger API documentation

## Running the Service

```bash
# Install dependencies
pnpm install

# Start the service
pnpm start:dev
```

The service will start on **port 3009**.

## API Endpoints

### Search

- `GET /search/journeys` - Search journeys with caching
- `GET /search/popular-routes` - Get popular routes
- `GET /search/autocomplete/stations` - Station name autocomplete

### Cache Management

- `POST /search/cache/invalidate` - Invalidate specific cache keys
- `DELETE /search/cache/clear` - Clear all search cache
- `GET /search/cache/stats` - Get cache statistics

### Analytics

- `GET /search/analytics/popular-searches` - Most searched routes
- `GET /search/analytics/trending` - Trending searches

## Environment Variables

```env
PORT=3009
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL_SEARCH_RESULTS=300
CACHE_TTL_POPULAR_ROUTES=3600
CACHE_TTL_STATIONS=7200
SCHEDULE_SERVICE_URL=http://localhost:3002
```

## API Documentation

Swagger UI: http://localhost:3009/api/docs

## Cache Strategy

1. **Journey Search Results**: 5 minutes TTL
2. **Popular Routes**: 1 hour TTL
3. **Station List**: 2 hours TTL
4. **Autocomplete**: 30 minutes TTL

## Performance

- Sub-10ms response time for cached queries
- Automatic cache warming for popular routes
- Cache hit rate tracking
