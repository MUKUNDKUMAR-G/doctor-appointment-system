package com.healthcare.appointmentsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Production security configuration with enhanced security headers and policies
 */
@Configuration
@EnableWebSecurity
@Profile("prod")
public class ProductionSecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;

    public ProductionSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                                  RateLimitingFilter rateLimitingFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    @Profile("prod")
    public SecurityFilterChain productionSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API endpoints (using JWT tokens)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )
            
            // Configure security headers
            .headers(headers -> headers
                // HTTPS enforcement
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000) // 1 year
                    .includeSubDomains(true)
                    .preload(true)
                )
                
                // Content Security Policy
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; " +
                                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                                    "style-src 'self' 'unsafe-inline'; " +
                                    "img-src 'self' data: https:; " +
                                    "font-src 'self' https:; " +
                                    "connect-src 'self' https:; " +
                                    "frame-ancestors 'none'; " +
                                    "base-uri 'self'; " +
                                    "form-action 'self'")
                )
                
                // X-Frame-Options
                .frameOptions(frameOptions -> frameOptions.deny())
                
                // X-Content-Type-Options
                .contentTypeOptions(contentTypeOptions -> contentTypeOptions.and())
                
                // Custom headers including XSS Protection, Permissions Policy, and Referrer Policy
                .addHeaderWriter(new XXssProtectionHeaderWriter())
                .addHeaderWriter((request, response) -> {
                    response.setHeader("Permissions-Policy", 
                        "geolocation=(), " +
                        "microphone=(), " +
                        "camera=(), " +
                        "payment=(), " +
                        "usb=(), " +
                        "magnetometer=(), " +
                        "gyroscope=(), " +
                        "speaker=()");
                    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                })
                
                // Cache Control for sensitive endpoints
                .cacheControl(cacheControl -> cacheControl.and())
            )
            
            // Configure authorization rules
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/error").permitAll()
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                // User profile endpoints (accessible by any authenticated user)
                .requestMatchers("/api/users/profile").authenticated()
                .requestMatchers("/api/users/profile/avatar").authenticated()
                .requestMatchers("/api/users/change-password").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // Doctor endpoints - availability should be accessible to patients too
                
                // Patient endpoints
                .requestMatchers("/api/appointments/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                .requestMatchers("/api/doctors/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Add custom filters
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Configure exception handling
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Access denied\"}");
                })
            );

        return http.build();
    }

    @Bean
    @Profile("prod")
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse allowed origins from environment variable
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        
        // Allowed methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "Accept", 
            "Origin"
        ));
        
        // Exposed headers
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-Total-Count",
            "X-Page-Number",
            "X-Page-Size"
        ));
        
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}