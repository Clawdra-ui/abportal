# ============================================
# Andreas Boutsikas Portal - Production Dockerfile
# Self-hosted deployment optimized
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema FIRST (needed for postinstall prisma generate)
COPY prisma ./prisma

# Copy package.json
COPY package.json ./

# Install dependencies with postinstall (prisma generate will work now)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN npm run build

# Production stage - minimal image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Create storage directories
RUN mkdir -p /data/andreas-portal/images /data/andreas-portal/zips && \
    chown -R appuser:appgroup /data

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Copy node_modules (runtime)
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# Switch to non-root user
USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
