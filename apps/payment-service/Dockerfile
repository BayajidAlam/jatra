# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY apps/payment-service/package.json ./apps/payment-service/

RUN pnpm install --no-frozen-lockfile
RUN pnpm add tslib -w --save-prod
RUN pnpm deploy --filter=payment-service --prod /tmp/payment-service-deploy

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/payment-service/node_modules ./apps/payment-service/node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=dependencies /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=dependencies /app/apps/payment-service/package.json ./apps/payment-service/

COPY libs ./libs
COPY apps/payment-service/src ./apps/payment-service/src
COPY apps/payment-service/tsconfig.json ./apps/payment-service/
COPY apps/payment-service/nest-cli.json ./apps/payment-service/

RUN npx prisma generate --schema=./libs/database/prisma/schema.prisma

RUN pnpm add -w webpack webpack-cli webpack-node-externals ts-loader tsconfig-paths-webpack-plugin terser-webpack-plugin

WORKDIR /app/apps/payment-service

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

RUN npx webpack --config webpack.config.js

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=dependencies /tmp/payment-service-deploy/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@6.19.0_prisma@6.19.0_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma

COPY --from=builder /app/apps/payment-service/dist/bundle.js ./dist/main.js

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
