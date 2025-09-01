# Dockerfile_T0.002 - Backend
# Multi-stage build for NestJS application
# Sprint 0 Task T0.002 - BR SISTEMAS Sysdesk

# =====================================
# Stage 1: Dependencies
# =====================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# =====================================
# Stage 2: Builder
# =====================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# =====================================
# Stage 3: Production
# =====================================
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3333/health || exit 1

# Start the application
CMD ["node", "dist/main"]

# =====================================
# Stage 4: Development (optional)
# =====================================
FROM node:20-alpine AS development
WORKDIR /app

# Install development tools
RUN apk add --no-cache curl git

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev)
RUN pnpm install

# Copy application source
COPY . .

# Expose port
EXPOSE 3333

# Start in development mode with hot reload
CMD ["pnpm", "run", "start:dev"]
