# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NODE_ENV=production
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_DEFAULT_REGION=us

ENV NODE_ENV=production
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_DEFAULT_REGION=us
ENV NEXT_SKIP_STATIC_OPTIMIZATION=true
ENV MEDUSA_BACKEND_URL=https://backend.minimica.com
ENV NEXT_PUBLIC_BASE_URL=https://minimica.com

RUN npm run build

# Stage 3: Run the app
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js 

ENV NODE_ENV=production
EXPOSE 8000
CMD ["npm", "start"]
