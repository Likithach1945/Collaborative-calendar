# Docker Deployment Guide

## Overview

This guide covers deploying the Calendar Application using Docker and Docker Compose with production-optimized containers.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────>│   Backend   │─────>│   MySQL DB  │
│   (Nginx)   │      │ (Spring)    │      │             │
│   Port 80   │      │  Port 8443  │      │  Port 3306  │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            v
                     ┌─────────────┐
                     │    Redis    │
                     │  (Optional) │
                     │  Port 6379  │
                     └─────────────┘
```

## Docker Optimizations

### Backend Dockerfile Features
- **Multi-stage build**: Separate build and runtime stages
- **Distroless base image**: Minimal attack surface (no shell, package manager)
- **Layer extraction**: Dependencies cached separately from app code
- **Non-root user**: Runs as `nonroot` (uid 65532)
- **Container-aware JVM**: `-XX:+UseContainerSupport` with 75% RAM limit
- **Security**: Minimal OS, only Java runtime and app

**Image Size**: ~250MB (vs ~500MB with full JRE alpine)

### Frontend Dockerfile Features
- **Multi-stage build**: Build stage discarded after npm build
- **Slim nginx**: `nginx:alpine-slim` base image
- **Production assets only**: No source maps, dev dependencies removed
- **Non-root user**: Runs as `nginx` user
- **Health check**: Built-in container health monitoring
- **Cache optimization**: Dependencies layer cached separately

**Image Size**: ~25MB (vs ~150MB without optimization)

### .dockerignore
Excludes unnecessary files from build context:
- `node_modules/` (reinstalled in container)
- `target/` (rebuilt in container)
- `.git/`, `.env`, IDE files
- Documentation (except README)

**Build Context Size Reduction**: ~80% smaller

## Prerequisites

1. **Docker**: Version 20.10 or higher
   ```bash
   docker --version
   ```

2. **Docker Compose**: Version 2.0 or higher
   ```bash
   docker-compose --version
   ```

3. **Google OAuth Credentials**: From [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:8443/login/oauth2/code/google`
     - `https://yourdomain.com/login/oauth2/code/google`

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/calendar.git
cd calendar
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# - Set strong passwords for DB_ROOT_PASSWORD and DB_PASSWORD
# - Add your Google OAuth credentials
# - Configure optional features (Redis, SMTP)
```

**Required Environment Variables:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `DB_ROOT_PASSWORD`: MySQL root password
- `DB_PASSWORD`: MySQL user password

### 3. Start Services
```bash
# Start all services (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Verify Deployment
```bash
# Check health endpoints
curl http://localhost/
curl http://localhost:8443/actuator/health

# Expected outputs:
# Frontend: Calendar app HTML
# Backend: {"status":"UP"}
```

### 5. Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8443
- **Health**: http://localhost:8443/actuator/health
- **Metrics**: http://localhost:8443/actuator/prometheus

## Docker Compose Services

### Database (MySQL)
```yaml
ports:
  - "3306:3306"
volumes:
  - db-data:/var/lib/mysql  # Persistent storage
healthcheck:
  test: mysqladmin ping
  interval: 10s
```

**Data Persistence**: Database data stored in `db-data` Docker volume

### Backend (Spring Boot)
```yaml
ports:
  - "8443:8443"
environment:
  SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/calendardb
  JAVA_OPTS: -Xmx512m -Xms256m
depends_on:
  db:
    condition: service_healthy
```

**Features**:
- Waits for MySQL to be healthy before starting
- Container-aware JVM memory settings
- Health check via `/actuator/health`

### Frontend (Nginx)
```yaml
ports:
  - "80:80"
depends_on:
  - backend
```

**Features**:
- Serves static React build
- Proxies API requests to backend
- Health check via HTTP GET

### Redis (Optional)
```yaml
# Uncomment in docker-compose.yml to enable
ports:
  - "6379:6379"
volumes:
  - redis-data:/data
```

**Enable Redis Caching:**
1. Uncomment `redis` service in `docker-compose.yml`
2. Uncomment Redis environment variables in `backend` service
3. Set `APP_CACHE_REDIS_ENABLED=true` in `.env`

## Production Deployment

### 1. Build Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
```

### 2. Use External Database
For production, consider managed database (RDS, Cloud SQL):

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://your-db.us-east-1.rds.amazonaws.com:3306/calendardb
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
  
  # Remove db service
  # db: ...
```

### 3. HTTPS/TLS Termination
Use reverse proxy (Nginx, Traefik, CloudFlare):

```nginx
# Example Nginx config
server {
    listen 443 ssl http2;
    server_name calendar.example.com;

    ssl_certificate /etc/ssl/certs/calendar.crt;
    ssl_certificate_key /etc/ssl/private/calendar.key;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8443/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Resource Limits
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
  
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### 5. Monitoring
```bash
# Prometheus metrics
curl http://localhost:8443/actuator/prometheus

# Container stats
docker stats

# Logs
docker-compose logs -f --tail=100 backend
```

## Scaling

### Horizontal Scaling (Multiple Instances)
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Requires load balancer (Nginx, HAProxy, etc.)
```

**Note**: For multi-instance deployments:
- Use external Redis for session storage
- Use external database (not Docker MySQL)
- Configure load balancer for sticky sessions

### Vertical Scaling (More Resources)
```bash
# Edit docker-compose.yml
services:
  backend:
    environment:
      JAVA_OPTS: -Xmx2g -Xms1g  # Increase heap size
```

## Maintenance

### Backups

**Database Backup:**
```bash
# Export database
docker-compose exec db mysqldump -u root -p calendardb > backup.sql

# Import database
docker-compose exec -T db mysql -u root -p calendardb < backup.sql
```

**Volume Backup:**
```bash
# Backup db-data volume
docker run --rm -v calendar_db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .

# Restore
docker run --rm -v calendar_db-data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /data
```

### Updates

**Update Application:**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

**Update Base Images:**
```bash
# Pull latest base images
docker-compose pull

# Rebuild with new bases
docker-compose build --no-cache
docker-compose up -d
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since timestamp
docker-compose logs --since="2024-01-01T00:00:00" backend
```

## Troubleshooting

### Backend Won't Start

**Issue**: Backend exits immediately

**Check**:
```bash
# View logs
docker-compose logs backend

# Common issues:
# - MySQL not ready -> Increase healthcheck interval
# - Invalid Google OAuth credentials -> Check .env
# - Port 8443 in use -> Change port mapping
```

### Database Connection Refused

**Issue**: `Connection refused` to MySQL

**Solution**:
```bash
# Verify MySQL is healthy
docker-compose ps db

# Wait for healthcheck to pass (10-30 seconds)
docker-compose logs db

# Check network
docker network inspect calendar_calendar-network
```

### Frontend Shows Blank Page

**Issue**: White screen on http://localhost

**Check**:
```bash
# Verify frontend is running
docker-compose ps frontend

# Check nginx logs
docker-compose logs frontend

# Common issues:
# - Build failed -> Rebuild with docker-compose build frontend
# - Wrong API URL -> Check nginx.conf proxy_pass
```

### Out of Memory

**Issue**: Backend killed by OOM

**Solution**:
```bash
# Increase container memory limit
# Edit docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G

# Reduce JVM heap
environment:
  JAVA_OPTS: -Xmx768m -Xms384m
```

### Performance Issues

**Slow response times**:

1. **Enable Redis caching**: Uncomment Redis in `docker-compose.yml`
2. **Check resource usage**: `docker stats`
3. **Scale backend**: `docker-compose up -d --scale backend=2`
4. **Optimize database**: Add indexes, tune MySQL config

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use HTTPS in production (TLS termination)
- [ ] Configure OAuth authorized redirect URIs
- [ ] Enable Redis authentication if used
- [ ] Use secrets management (AWS Secrets Manager, Vault)
- [ ] Regularly update base images (`docker-compose build --no-cache`)
- [ ] Monitor security advisories for dependencies
- [ ] Restrict database ports (don't expose 3306 publicly)
- [ ] Use private Docker registry for production images
- [ ] Enable Docker Content Trust (image signing)

## Performance Metrics

### Startup Times
- Backend: ~15-25 seconds (including DB migrations)
- Frontend: ~2-3 seconds
- Database: ~5-10 seconds

### Resource Usage (Idle)
- Backend: ~300MB RAM, 1-2% CPU
- Frontend: ~10MB RAM, 0% CPU
- Database: ~200MB RAM, 1% CPU
- Total: ~510MB RAM

### Response Times (p95)
- API endpoints: <100ms
- Static assets: <10ms
- Database queries: <50ms

## Further Reading

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Distroless Images](https://github.com/GoogleContainerTools/distroless)
- [Spring Boot Docker](https://spring.io/guides/topicals/spring-boot-docker/)
- [Nginx Optimization](https://www.nginx.com/blog/tuning-nginx/)

---

**Last Updated**: October 16, 2025
**Docker Version**: 24.0+
**Docker Compose Version**: 2.0+
