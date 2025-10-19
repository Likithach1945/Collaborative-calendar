package com.example.calendar.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test cache configuration
 */
@SpringBootTest
@TestPropertySource(properties = {
        "app.cache.redis.enabled=false" // Use in-memory cache for tests
})
public class CacheConfigTest {

    @Autowired
    private CacheManager cacheManager;

    @Test
    void cacheManagerShouldBeConfigured() {
        assertThat(cacheManager).isNotNull();
    }

    @Test
    void cacheManagerShouldHaveEventCache() {
        assertThat(cacheManager.getCacheNames()).contains("events");
    }

    @Test
    void cacheManagerShouldHaveInvitationsCache() {
        assertThat(cacheManager.getCacheNames()).contains("invitations");
    }

    @Test
    void cacheManagerShouldHaveAvailabilityCache() {
        assertThat(cacheManager.getCacheNames()).contains("availability");
    }

    @Test
    void cacheShouldStoreAndRetrieveValues() {
        var cache = cacheManager.getCache("events");
        assertThat(cache).isNotNull();

        String testKey = "test-key";
        String testValue = "test-value";

        // Store value
        cache.put(testKey, testValue);

        // Retrieve value
        var retrieved = cache.get(testKey, String.class);
        assertThat(retrieved).isEqualTo(testValue);

        // Clear cache
        cache.clear();
        assertThat(cache.get(testKey)).isNull();
    }
}
