# Stage 1: Build the application
FROM node:18.19.0-alpine3.18 AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm install -g npm@latest

# Enable corepack for yarn
RUN corepack enable

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies with retry logic and debug output
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \
    { \
      echo "Running yarn install..." && \
      yarn config set network-timeout 600000 -g && \
      yarn install --frozen-lockfile --network-timeout 600000 || \
      (echo "First attempt failed, retrying..." && yarn install --frozen-lockfile --network-timeout 600000) || \
      (echo "Second attempt failed, retrying one more time..." && yarn install --frozen-lockfile --network-timeout 600000); \
    }

# Copy the rest of the application
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build the application
RUN yarn build

# Stage 2: Create the production image
FROM node:18.19.0-alpine3.18 AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \
    corepack enable && \
    yarn config set network-timeout 600000 -g && \
    yarn install --production --frozen-lockfile --network-timeout 600000

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["yarn", "start"]
