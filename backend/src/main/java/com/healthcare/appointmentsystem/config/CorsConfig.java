package com.healthcare.appointmentsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${cors.allowed-headers:Authorization,Content-Type,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins - use patterns for flexibility but security
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOriginPatterns(origins);
        
        // Set allowed methods - be explicit about what's allowed
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // Set allowed headers - be specific for security
        List<String> headers = Arrays.asList(allowedHeaders.split(","));
        configuration.setAllowedHeaders(headers);
        
        // Set credentials - required for JWT tokens
        configuration.setAllowCredentials(allowCredentials);
        
        // Expose headers that the client can access
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "X-Requested-With", 
                "Accept", 
                "Origin", 
                "Access-Control-Request-Method", 
                "Access-Control-Request-Headers",
                "X-Total-Count",
                "X-Page-Number",
                "X-Page-Size"
        ));
        
        // Set max age for preflight requests (1 hour)
        configuration.setMaxAge(maxAge);
        
        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        // WebSocket endpoints need CORS configuration
        source.registerCorsConfiguration("/ws/**", configuration);
        
        // More restrictive CORS for auth endpoints
        CorsConfiguration authConfiguration = new CorsConfiguration();
        authConfiguration.setAllowedOriginPatterns(origins);
        authConfiguration.setAllowedMethods(Arrays.asList("POST", "OPTIONS"));
        authConfiguration.setAllowedHeaders(Arrays.asList("Content-Type", "Accept", "Origin"));
        authConfiguration.setAllowCredentials(true);
        authConfiguration.setMaxAge(maxAge);
        source.registerCorsConfiguration("/api/auth/**", authConfiguration);
        
        return source;
    }
}