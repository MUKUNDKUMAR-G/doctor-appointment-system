package com.healthcare.appointmentsystem.config;

import com.healthcare.appointmentsystem.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Autowired
    private SecurityProperties securityProperties;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .contentTypeOptions(contentTypeOptions -> contentTypeOptions.and())
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                .maxAgeInSeconds(31536000)
                                .includeSubDomains(true)
                        )
                        .addHeaderWriter((request, response) -> {
                            // Add Content Security Policy
                            response.setHeader("Content-Security-Policy", 
                                "default-src 'self'; " +
                                "script-src 'self' 'unsafe-inline'; " +
                                "style-src 'self' 'unsafe-inline'; " +
                                "img-src 'self' data: https:; " +
                                "connect-src 'self'; " +
                                "font-src 'self'; " +
                                "object-src 'none'; " +
                                "media-src 'self'; " +
                                "frame-src 'none';"
                            );
                            // Add X-XSS-Protection
                            response.setHeader("X-XSS-Protection", "1; mode=block");
                            // Add Permissions Policy
                            response.setHeader("Permissions-Policy", 
                                "camera=(), microphone=(), geolocation=(), payment=()");
                            // Add Referrer Policy
                            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                        })
                )
                .requiresChannel(channel -> {
                    if (securityProperties.isHttpsOnly()) {
                        channel.anyRequest().requiresSecure();
                    }
                })
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()
                        .requestMatchers("/api/doctors/search").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/avatars/**").permitAll()
                        
                        // WebSocket endpoints
                        .requestMatchers("/ws/**").permitAll()
                        
                        // Patient endpoints
                        .requestMatchers("/api/appointments/patient/**").hasRole("PATIENT")
                        .requestMatchers("/api/appointments/book").hasRole("PATIENT")
                        .requestMatchers("/api/appointments/cancel/**").hasAnyRole("PATIENT", "DOCTOR")
                        
                        // Doctor endpoints
                        .requestMatchers("/api/doctors/profile/**").hasRole("DOCTOR")
                        .requestMatchers("/api/appointments/doctor/**").hasRole("DOCTOR")
                        
                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        
                        // User profile endpoints (accessible by any authenticated user)
                        .requestMatchers("/api/users/profile").authenticated()
                        .requestMatchers("/api/users/profile/avatar").authenticated()
                        .requestMatchers("/api/users/change-password").authenticated()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        
                        // General authenticated endpoints
                        .requestMatchers("/api/appointments/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                        .requestMatchers("/api/doctors/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                        .requestMatchers("/api/profile/**").authenticated()
                        
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }



    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}