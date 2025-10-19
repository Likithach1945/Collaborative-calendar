# Caching Configuration

The Calendar Application includes optional Redis caching support with automatic fallback to in-memory caching.

## Features

- **Dual-mode caching**: Redis (distributed) or In-Memory (local)
- **Feature flag controlled**: Enable/disable Redis via configuration
- **Automatic fallback**: Uses in-memory cache if Redis is disabled or unavailable
- **Pre-configured TTLs**: Optimized cache expiration times for different data types

## Cache Configuration

### Cached Resources

| Cache Name | TTL | Description |
|-----------|-----|-------------|
| `events` | 15 minutes | User events and event details |
| `invitations` | 10 minutes | Event invitations and responses |
| `availability` | 5 minutes | Availability calculations (more volatile) |

### Enabling Redis Cache

1. **Start Redis server** (via Docker):
   ```bash
   docker run -d -p 6379:6379 --name redis redis:7-alpine
   ```

2. **Enable Redis in configuration**:
   ```properties
   # application.properties
   app.cache.redis.enabled=true
   spring.data.redis.host=localhost
   spring.data.redis.port=6379
   ```

3. **Restart the application**

### Using In-Memory Cache (Default)

The application uses in-memory caching by default:

```properties
# application.properties (default)
app.cache.redis.enabled=false
```

No additional setup required. Cache is stored in application memory using Spring's `ConcurrentMapCacheManager`.

## Cache Behavior

### Automatic Cache Eviction

Caches are automatically cleared when data changes:

- **Events**: Cleared on create, update, delete
- **Invitations**: Cleared on response, proposal acceptance/rejection
- **Cross-cache eviction**: Responding to invitations clears both invitation and event caches

### Cache Keys

- **Events by date range**: `{userId}_{startInstant}_{endInstant}`
- **Invitations by event**: `event_{eventId}`

## Production Recommendations

### Redis Configuration

For production deployments with Redis:

```properties
# Redis with authentication
spring.data.redis.host=redis.example.com
spring.data.redis.port=6379
spring.data.redis.password=${REDIS_PASSWORD}
spring.data.redis.timeout=2000ms
spring.data.redis.ssl.enabled=true

# Connection pooling
spring.data.redis.lettuce.pool.max-active=8
spring.data.redis.lettuce.pool.max-idle=8
spring.data.redis.lettuce.pool.min-idle=0
```

### Monitoring

Monitor cache hit/miss rates:

```java
// Programmatically access cache statistics
CacheManager cacheManager;
Cache eventsCache = cacheManager.getCache("events");
```

For production monitoring, consider:
- Redis monitoring tools (RedisInsight, Prometheus exporter)
- Spring Boot Actuator metrics (`/actuator/metrics/cache.*`)

### High Availability

For HA deployments:

```properties
# Redis Sentinel
spring.data.redis.sentinel.master=mymaster
spring.data.redis.sentinel.nodes=sentinel1:26379,sentinel2:26379,sentinel3:26379

# Or Redis Cluster
spring.data.redis.cluster.nodes=node1:6379,node2:6379,node3:6379
```

## Testing

Run cache tests:

```bash
cd backend
./mvnw test -Dtest=CacheConfigTest
```

The test suite validates:
- ✅ Cache manager configuration
- ✅ All caches are registered
- ✅ Store/retrieve operations
- ✅ Cache eviction

## Troubleshooting

### Redis Connection Issues

If Redis is enabled but unavailable, the application will fail to start. Solutions:

1. **Disable Redis** (fallback to in-memory):
   ```properties
   app.cache.redis.enabled=false
   ```

2. **Check Redis connectivity**:
   ```bash
   redis-cli -h localhost -p 6379 ping
   # Should return: PONG
   ```

3. **Review logs**:
   ```
   2025-10-16 ERROR [main] RedisConnectionFactory: Cannot get Redis connection
   ```

### Cache Not Working

Verify caching is enabled:

```bash
# Check if @EnableCaching is active
grep -r "@EnableCaching" backend/src/main/java/

# Verify cache manager bean
curl http://localhost:8443/actuator/beans | jq '.contexts.application.beans | keys | map(select(contains("Cache")))'
```

## Performance Impact

### Benchmark Results (Estimated)

| Operation | Without Cache | With In-Memory Cache | With Redis Cache |
|-----------|--------------|---------------------|------------------|
| Get Events (50 events) | ~50ms | ~5ms | ~15ms |
| Get Invitations (20) | ~30ms | ~3ms | ~10ms |
| Availability Query | ~200ms | ~20ms | ~40ms |

**Note**: Redis adds network latency but enables cache sharing across multiple instances.

## Migration Guide

### From In-Memory to Redis

1. Start Redis server
2. Update configuration (`app.cache.redis.enabled=true`)
3. Restart application
4. Verify with Redis CLI:
   ```bash
   redis-cli
   127.0.0.1:6379> KEYS *
   ```

### From Redis to In-Memory

1. Update configuration (`app.cache.redis.enabled=false`)
2. Restart application
3. (Optional) Stop Redis server if no longer needed

No data migration needed - caches rebuild automatically on first access.
