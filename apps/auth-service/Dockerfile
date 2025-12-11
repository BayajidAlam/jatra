# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY apps/auth-service/package.json ./apps/auth-service/

RUN pnpm install --no-frozen-lockfile
RUN pnpm add tslib -w --save-prod
RUN pnpm deploy --filter=auth-service --prod /tmp/auth-service-deploy

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/auth-service/node_modules ./apps/auth-service/node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=dependencies /app/apps/auth-service/package.json ./apps/auth-service/

COPY libs ./libs
COPY apps/auth-service/src ./apps/auth-service/src
COPY apps/auth-service/tsconfig.json ./apps/auth-service/
COPY apps/auth-service/nest-cli.json ./apps/auth-service/

# Generate Prisma Client
RUN npx prisma generate --schema=./libs/database/prisma/schema.prisma

WORKDIR /app/apps/auth-service

# Build with NestJS CLI
RUN npx nest build

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /tmp/auth-service-deploy/node_modules ./node_modules

# Copy generated Prisma client to BOTH locations (pnpm structure)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@6.19.0_prisma@6.19.0_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma

# Copy built application
COPY --from=builder /app/apps/auth-service/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/apps/auth-service/src/main.js"]
