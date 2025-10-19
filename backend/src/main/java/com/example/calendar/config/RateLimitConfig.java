package com.example.calendar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting configuration using in-memory token bucket
 */
@Configuration
public class RateLimitConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RateLimitInterceptor())
                .addPathPatterns("/api/v1/availability/**"); // Rate limit availability endpoint
    }

    /**
     * Simple in-memory rate limiter using token bucket algorithm
     */
    public static class RateLimitInterceptor implements HandlerInterceptor {
        
        // Max requests per minute per IP
        private static final int MAX_REQUESTS_PER_MINUTE = 20;
        
        // Storage for request counts per IP
        private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
        
        // Cleanup thread to remove old entries
        public RateLimitInterceptor() {
            Thread cleanupThread = new Thread(() -> {
                while (true) {
                    try {
                        Thread.sleep(60000); // Every minute
                        long now = System.currentTimeMillis();
                        buckets.entrySet().removeIf(entry -> 
                            now - entry.getValue().lastRefill > 120000); // Remove after 2 minutes of inactivity
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
            cleanupThread.setDaemon(true);
            cleanupThread.start();
        }

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
                throws Exception {
            
            String clientIp = getClientIp(request);
            TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket());
            
            if (!bucket.tryConsume()) {
                response.setStatus(429); // Too Many Requests
                response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
                response.setHeader("X-RateLimit-Remaining", "0");
                response.setHeader("X-RateLimit-Reset", String.valueOf(bucket.getResetTime()));
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\"}");
                response.setContentType("application/json");
                return false;
            }
            
            response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getRemaining()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(bucket.getResetTime()));
            
            return true;
        }

        private String getClientIp(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }

        /**
         * Token bucket for rate limiting
         */
        private static class TokenBucket {
            private final AtomicInteger tokens = new AtomicInteger(MAX_REQUESTS_PER_MINUTE);
            private volatile long lastRefill = System.currentTimeMillis();

            public synchronized boolean tryConsume() {
                refill();
                if (tokens.get() > 0) {
                    tokens.decrementAndGet();
                    return true;
                }
                return false;
            }

            public int getRemaining() {
                refill();
                return tokens.get();
            }

            public long getResetTime() {
                return lastRefill + 60000; // Next refill time
            }

            private void refill() {
                long now = System.currentTimeMillis();
                long timePassed = now - lastRefill;
                
                if (timePassed >= 60000) { // Refill every minute
                    tokens.set(MAX_REQUESTS_PER_MINUTE);
                    lastRefill = now;
                }
            }
        }
    }
}
