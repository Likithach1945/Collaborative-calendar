package com.example.calendar.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Security headers configuration
 * Adds security headers to all HTTP responses
 */
@Configuration
public class SecurityHeadersConfig {

    /**
     * Filter to add security headers to all responses
     */
    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new SecurityHeadersFilter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    /**
     * CORS configuration
     * Tightened for production use
     * NOTE: Disabled to avoid conflict with SecurityConfig CORS configuration
     */
    /*
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:5173",  // Development
                                "https://calendar.example.com"  // Production (update with actual domain)
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600); // Cache preflight for 1 hour
            }
        };
    }
    */

    /**
     * Security headers filter implementation
     */
    public static class SecurityHeadersFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            // Content Security Policy
            // Restricts resource loading to prevent XSS attacks
            httpResponse.setHeader("Content-Security-Policy",
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +  // Allow inline scripts for React
                    "style-src 'self' 'unsafe-inline'; " +  // Allow inline styles
                    "img-src 'self' data: https: http://localhost:*; " +  // Allow localhost images for development
                    "font-src 'self' data:; " +
                    "connect-src 'self' http://localhost:* https://accounts.google.com https://oauth2.googleapis.com; " +  // Allow localhost connections
                    "frame-ancestors 'none'; " +  // Prevent clickjacking
                    "base-uri 'self'; " +
                    "form-action 'self';"
            );
            
            // HTTP Strict Transport Security
            // Forces HTTPS for 1 year, including subdomains
            httpResponse.setHeader("Strict-Transport-Security",
                    "max-age=31536000; includeSubDomains; preload");
            
            // X-Content-Type-Options
            // Prevents MIME type sniffing
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            
            // X-Frame-Options
            // Prevents clickjacking attacks
            httpResponse.setHeader("X-Frame-Options", "DENY");
            
            // X-XSS-Protection
            // Legacy XSS protection (CSP is preferred)
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Referrer-Policy
            // Controls referrer information sent with requests
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Permissions-Policy (formerly Feature-Policy)
            // Restricts browser features
            httpResponse.setHeader("Permissions-Policy",
                    "geolocation=(), " +
                    "microphone=(), " +
                    "camera=(), " +
                    "payment=(), " +
                    "usb=(), " +
                    "magnetometer=(), " +
                    "gyroscope=(), " +
                    "accelerometer=()");
            
            chain.doFilter(request, response);
        }
    }
}
