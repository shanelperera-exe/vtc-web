# Multi-stage Dockerfile for Vite React app
# Builder stage: build static assets with Node.js
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm i --no-audit --no-fund; fi

# Pass API base URL at build time for axios
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage: serve with Nginx
FROM nginx:1.27-alpine

# Nginx config for SPA routing + compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root already used by nginx image (user: nginx)
EXPOSE 80

# Optional healthcheck (handled in docker-compose)
# HEALTHCHECK CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]