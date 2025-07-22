# Stage 1: deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: runner
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/medusa-config.js ./medusa-config.js

ENV NODE_ENV=production
EXPOSE 9000
CMD ["node", "dist/index.js"]
