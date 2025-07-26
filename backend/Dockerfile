# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
COPY yarn.lock* ./
RUN npm ci

# Copy source code
COPY . .

# Build the application using Medusa CLI
RUN npx medusa build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install system dependencies and curl for healthcheck
RUN apk add --no-cache libc6-compat curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy the built application from the correct location
COPY --from=builder /app/.medusa/server ./

# Install production dependencies in the build directory
RUN npm install --production

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R medusa:nodejs /app

# Switch to non-root user
USER medusa

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application with migration
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]