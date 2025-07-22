# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Debug: List all files in the root to verify medusa-config.js is there
RUN echo "=== Files in /app ==="
RUN ls -la /app/
RUN echo "=== Looking for medusa-config.js ==="
RUN ls -la /app/medusa-config.js || echo "medusa-config.js NOT FOUND"

RUN npm run build

# Debug: Check what was built
RUN echo "=== Build output ==="
RUN ls -la /app/.medusa/ || echo ".medusa directory not found"
RUN ls -la /app/.medusa/server/ || echo ".medusa/server directory not found"

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install Medusa CLI globally
RUN npm install -g @medusajs/medusa-cli

# Install production dependencies
COPY package*.json package-lock.json* ./
RUN npm ci --only=production

# Copy the built application from builder stage
# Medusa v2 builds to .medusa/server, not dist
COPY --from=builder /app/.medusa/server ./

# Copy the medusa config file
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts

# Debug: Verify files were copied
RUN echo "=== Files in production container ==="
RUN ls -la /app/

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 9000

# Run migrations and start the application
CMD ["sh", "-c", "npm run db:migrate && npm run start"]