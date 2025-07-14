# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Stage 2: Create the production image
FROM node:18-alpine AS runner

WORKDIR /app

# Install system dependencies for node-gyp and other native modules
RUN apk add --no-cache python3 make g++

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/medusa-config.js ./medusa-config.js

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Expose the port the app runs on
EXPOSE 9000

# Start the application
CMD ["yarn", "start"]
