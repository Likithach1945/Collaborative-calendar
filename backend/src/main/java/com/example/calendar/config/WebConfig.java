package com.example.calendar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.util.UrlPathHelper;

import java.util.Arrays;
import java.util.Collections;

/**
 * Web configuration for handling redirects, CORS, and URL path handling
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;
    
    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,PATCH,OPTIONS}")
    private String[] allowedMethods;
    
    @Value("${cors.max-age:3600}")
    private long maxAge;

    /**
     * Configure view controllers for default redirects
     * @param registry the view controller registry
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect /login to the frontend login page
        registry.addRedirectViewController("/login", allowedOrigins[0] + "/login");
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }
    
    /**
     * Configure CORS for cross-origin requests
     * @param registry the CORS registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods(allowedMethods)
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Type", "X-Rate-Limit-Remaining", "X-Rate-Limit-Reset")
            .allowCredentials(true)
            .maxAge(maxAge);
    }
    
    /**
     * Configure path matching to handle URL path variables correctly
     * @param configurer the path match configurer
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Configure URL path helper to handle matrix variables and decode URLs properly
        UrlPathHelper urlPathHelper = new UrlPathHelper();
        // Keep encoded paths as they are - important for handling special characters in path variables
        urlPathHelper.setUrlDecode(true);
        // Don't remove semicolons - important for matrix variables
        urlPathHelper.setRemoveSemicolonContent(false);
        configurer.setUrlPathHelper(urlPathHelper);
    }
    
    /**
     * Create a CORS filter for pre-flight OPTIONS requests
     * @return the CORS filter bean
     */
    @Bean
    public CorsFilter corsFilter() {
        final CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedMethods(Arrays.asList(allowedMethods));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Rate-Limit-Remaining", "X-Rate-Limit-Reset"));
        config.setMaxAge(maxAge);
        
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
    
    // GlobalExceptionHandler is configured via @RestControllerAdvice annotation
    // No need to create a bean here
}