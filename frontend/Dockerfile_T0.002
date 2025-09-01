# Dockerfile_T0.002 - Frontend
# Multi-stage build for Next.js application
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

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# =====================================
# Stage 3: Production
# =====================================
FROM node:20-alpine AS production
WORKDIR /app

# Install production runtime dependencies
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]

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
EXPOSE 3000

# Environment variables for development
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Start in development mode with hot reload
CMD ["pnpm", "dev"]
