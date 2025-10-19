# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source and build
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8443
ARG VITE_ENVIRONMENT=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build && \
    # Remove source maps in production
    find dist -name "*.map" -type f -delete

# Stage 2: Production - Serve with nginx
FROM nginx:1.25-alpine-slim AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache wget

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets with proper ownership
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy optimized nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create health check endpoint
RUN echo "healthy" > /usr/share/nginx/html/health

# Security: Run as non-root user
USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
