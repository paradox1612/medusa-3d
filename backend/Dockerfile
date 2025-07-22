# Stage 1: Build the application
FROM node:18.19.0-alpine3.18 AS builder

WORKDIR /app

# Install system dependencies for node-gyp and other native modules
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm install -g npm@latest

# Enable corepack for yarn
RUN corepack enable

# Copy package files
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

# Build the application
RUN yarn build

# Stage 2: Create the production image
FROM node:18.19.0-alpine3.18 AS runner

WORKDIR /app

# Install system dependencies for node-gyp and other native modules
RUN apk add --no-cache python3 make g++

# Enable corepack for yarn
RUN corepack enable

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/medusa-config.js ./medusa-config.js

# Set environment to production
ENV NODE_ENV=production

# Install production dependencies only with retry logic
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \
    { \
      echo "Running yarn install for production..." && \
      yarn config set network-timeout 600000 -g && \
      yarn install --production --frozen-lockfile --network-timeout 600000 || \
      (echo "First attempt failed, retrying..." && yarn install --production --frozen-lockfile --network-timeout 600000); \
    }

# Expose the port the app runs on
EXPOSE 9000

# Start the application
CMD ["yarn", "start"]
