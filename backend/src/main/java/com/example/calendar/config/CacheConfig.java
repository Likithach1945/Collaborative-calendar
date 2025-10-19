package com.example.calendar.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

/**
 * Cache configuration with Redis support (optional).
 * Falls back to in-memory cache if Redis is disabled or unavailable.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Redis-based cache manager (enabled via feature flag).
     * Activated when: app.cache.redis.enabled=true
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.cache.redis.enabled", havingValue = "true")
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)) // Default TTL: 30 minutes
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withCacheConfiguration("events", 
                        config.entryTtl(Duration.ofMinutes(15))) // Events cache: 15 min TTL
                .withCacheConfiguration("invitations", 
                        config.entryTtl(Duration.ofMinutes(10))) // Invitations: 10 min TTL
                .withCacheConfiguration("availability", 
                        config.entryTtl(Duration.ofMinutes(5))) // Availability: 5 min TTL (more volatile)
                .build();
    }

    /**
     * In-memory cache manager (fallback).
     * Used when Redis is disabled or unavailable.
     */
    @Bean
    @ConditionalOnProperty(name = "app.cache.redis.enabled", havingValue = "false", matchIfMissing = true)
    public CacheManager inMemoryCacheManager() {
        return new ConcurrentMapCacheManager(
                "events", 
                "invitations", 
                "availability"
        );
    }

}
