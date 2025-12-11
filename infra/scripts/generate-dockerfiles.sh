#!/bin/bash
set -e

# Clean Dockerfile generator - only what each service needs

SERVICES=(
  "auth-service:3001:NO:YES"           # port:prisma:bcrypt
  "schedule-service:3002:YES:NO"
  "seat-reservation-service:3003:YES:NO"
  "payment-service:3004:YES:NO"
  "booking-service:3005:YES:NO"
  "ticket-service:3006:YES:NO"
  "notification-service:3007:YES:NO"
  "user-service:3008:YES:NO"
  "search-service:3009:YES:NO"
  "admin-service:3010:YES:NO"
  "reporting-service:3011:YES:NO"
)

echo "🧹 Generating clean Dockerfiles..."

for SERVICE_CONFIG in "${SERVICES[@]}"; do
  IFS=':' read -r SERVICE PORT PRISMA BCRYPT <<< "$SERVICE_CONFIG"
  
  cat > "apps/$SERVICE/Dockerfile" << 'HEADER'
FROM node:20-alpine AS deps
HEADER

  [ "$BCRYPT" = "YES" ] && echo "RUN apk add --no-cache python3 make g++" >> "apps/$SERVICE/Dockerfile"

  cat >> "apps/$SERVICE/Dockerfile" << 'BASE'
WORKDIR /app
COPY package.json tsconfig.base.json pnpm-lock.yaml ./
RUN printf 'packages:\n  - "apps/*"\n  - "libs/*"\n' > pnpm-workspace.yaml
RUN corepack enable && corepack prepare pnpm@9 --activate
BASE

  echo "COPY apps/$SERVICE/package.json apps/$SERVICE/tsconfig.json ./apps/$SERVICE/" >> "apps/$SERVICE/Dockerfile"
  
  [ "$PRISMA" = "YES" ] && echo "COPY libs/database/prisma/schema.prisma ./libs/database/prisma/" >> "apps/$SERVICE/Dockerfile"
  
  cat >> "apps/$SERVICE/Dockerfile" << 'DEPS'
COPY libs/common ./libs/common
RUN pnpm install --no-frozen-lockfile
RUN pnpm add -w tslib
DEPS

  [ "$PRISMA" = "YES" ] && echo "RUN npx prisma generate --schema=./libs/database/prisma/schema.prisma" >> "apps/$SERVICE/Dockerfile"

  cat >> "apps/$SERVICE/Dockerfile" << BUILD

FROM deps AS builder
WORKDIR /app
COPY apps/$SERVICE/src ./apps/$SERVICE/src
COPY apps/$SERVICE/tsconfig.json ./apps/$SERVICE/
RUN cd apps/$SERVICE && pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/$SERVICE/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/$SERVICE/package.json ./
RUN addgroup -g 1001 nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE $PORT
CMD ["node", "dist/main.js"]
BUILD

  echo "✅ $SERVICE"
done

echo ""
echo "✅ All Dockerfiles ready"
