# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy schedule-service package.json
COPY apps/schedule-service/package.json ./apps/schedule-service/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Add tslib to root (TypeScript needs it for decorators/helpers)
RUN pnpm add tslib -w --save-prod

# Create isolated production node_modules for schedule-service only
RUN pnpm deploy --filter=schedule-service --prod /tmp/schedule-deploy

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/schedule-service/node_modules ./apps/schedule-service/node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=dependencies /app/apps/schedule-service/package.json ./apps/schedule-service/

# Copy all shared libraries (needed for imports)
COPY libs ./libs

# Copy schedule-service source code and config
COPY apps/schedule-service/src ./apps/schedule-service/src
COPY apps/schedule-service/tsconfig.json ./apps/schedule-service/
COPY apps/schedule-service/nest-cli.json ./apps/schedule-service/

# Generate Prisma Client (CRITICAL: Do this before TypeScript build)
RUN npx prisma generate --schema=./libs/database/prisma/schema.prisma

# Install webpack and tsconfig-paths for bundling
RUN pnpm add -w webpack webpack-cli webpack-node-externals ts-loader tsconfig-paths-webpack-plugin terser-webpack-plugin

# Build the schedule-service with webpack (preserves decorators properly)
WORKDIR /app/apps/schedule-service

# Create webpack config with tsconfig paths support
RUN echo "const path = require('path');" > webpack.config.js && \
    echo "const nodeExternals = require('webpack-node-externals');" >> webpack.config.js && \
    echo "const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');" >> webpack.config.js && \
    echo "const TerserPlugin = require('terser-webpack-plugin');" >> webpack.config.js && \
    echo "module.exports = {" >> webpack.config.js && \
    echo "  entry: './src/main.ts'," >> webpack.config.js && \
    echo "  target: 'node'," >> webpack.config.js && \
    echo "  mode: 'production'," >> webpack.config.js && \
    echo "  externals: [nodeExternals()]," >> webpack.config.js && \
    echo "  module: { rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }] }," >> webpack.config.js && \
    echo "  resolve: { extensions: ['.ts', '.js'], plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })] }," >> webpack.config.js && \
    echo "  output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.js' }," >> webpack.config.js && \
    echo "  optimization: { minimize: true, minimizer: [new TerserPlugin({ terserOptions: { keep_classnames: true, keep_fnames: true } })] }" >> webpack.config.js && \
    echo "};" >> webpack.config.js

# Build with webpack (handles decorators + metadata correctly)
RUN npx webpack --config webpack.config.js

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy ONLY isolated production node_modules (305MB vs 1.24GB)
COPY --from=dependencies /tmp/schedule-deploy/node_modules ./node_modules

# Copy generated Prisma client to both locations (pnpm structure)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@6.19.0_prisma@6.19.0_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma

# Copy the bundled application (single file with all code resolved)
COPY --from=builder /app/apps/schedule-service/dist/bundle.js ./dist/main.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose port (schedule-service runs on 3002)
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the bundled application
CMD ["node", "dist/main.js"]



