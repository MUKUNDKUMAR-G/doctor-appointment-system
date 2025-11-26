package com.healthcare.appointmentsystem.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Configuration for monitoring, metrics, and performance tracking in production
 */
@Configuration
@Profile("prod")
public class MonitoringConfig {

    private static final Logger logger = LoggerFactory.getLogger(MonitoringConfig.class);

    /**
     * Customize meter registry for application-specific metrics
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "appointment-system",
            "environment", "production"
        );
    }

    /**
     * Custom health indicator for database connectivity
     */
    @Bean
    public HealthIndicator databaseHealthIndicator(DataSource dataSource) {
        return () -> {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(5)) {
                    return Health.up()
                        .withDetail("database", "MySQL")
                        .withDetail("status", "Connected")
                        .build();
                } else {
                    return Health.down()
                        .withDetail("database", "MySQL")
                        .withDetail("status", "Connection invalid")
                        .build();
                }
            } catch (SQLException e) {
                return Health.down()
                    .withDetail("database", "MySQL")
                    .withDetail("status", "Connection failed")
                    .withDetail("error", e.getMessage())
                    .build();
            }
        };
    }

    /**
     * Request timing and logging filter for performance monitoring
     */
    @Bean
    public RequestTimingFilter requestTimingFilter(MeterRegistry meterRegistry) {
        return new RequestTimingFilter(meterRegistry);
    }

    /**
     * Filter to track request timing and log slow requests
     */
    public static class RequestTimingFilter extends OncePerRequestFilter {
        
        private static final Logger requestLogger = LoggerFactory.getLogger("REQUEST_TIMING");
        private final MeterRegistry meterRegistry;
        private final Timer requestTimer;

        public RequestTimingFilter(MeterRegistry meterRegistry) {
            this.meterRegistry = meterRegistry;
            this.requestTimer = Timer.builder("http.server.requests")
                .description("HTTP request timing")
                .register(meterRegistry);
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, 
                                      HttpServletResponse response, 
                                      FilterChain filterChain) throws ServletException, IOException {
            
            long startTime = System.currentTimeMillis();
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String userAgent = request.getHeader("User-Agent");
            String clientIp = getClientIpAddress(request);
            
            try {
                filterChain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                int status = response.getStatus();
                
                // Record metrics
                Timer.Sample sample = Timer.start(meterRegistry);
                sample.stop(Timer.builder("http.server.requests")
                    .tag("method", method)
                    .tag("uri", uri)
                    .tag("status", String.valueOf(status))
                    .register(meterRegistry));
                
                // Log request details
                if (duration > 2000) { // Log slow requests (> 2 seconds)
                    requestLogger.warn("SLOW_REQUEST: {} {} - {}ms - Status: {} - IP: {} - User-Agent: {}", 
                        method, uri, duration, status, clientIp, userAgent);
                } else if (status >= 400) { // Log error responses
                    requestLogger.warn("ERROR_REQUEST: {} {} - {}ms - Status: {} - IP: {} - User-Agent: {}", 
                        method, uri, duration, status, clientIp, userAgent);
                } else {
                    requestLogger.info("REQUEST: {} {} - {}ms - Status: {} - IP: {}", 
                        method, uri, duration, status, clientIp);
                }
                
                // Security logging for sensitive endpoints
                if (uri.contains("/auth/") || uri.contains("/admin/")) {
                    requestLogger.info("SECURITY_ACCESS: {} {} - Status: {} - IP: {} - Duration: {}ms", 
                        method, uri, status, clientIp, duration);
                }
            }
        }

        private String getClientIpAddress(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            
            return request.getRemoteAddr();
        }
    }

    /**
     * Custom health indicator for JWT service
     */
    @Bean
    public HealthIndicator jwtHealthIndicator() {
        return () -> {
            try {
                // Simple check to ensure JWT configuration is valid
                String jwtSecret = System.getenv("JWT_SECRET");
                if (jwtSecret != null && jwtSecret.length() >= 32) {
                    return Health.up()
                        .withDetail("jwt", "Configuration valid")
                        .build();
                } else {
                    return Health.down()
                        .withDetail("jwt", "Invalid configuration")
                        .build();
                }
            } catch (Exception e) {
                return Health.down()
                    .withDetail("jwt", "Configuration error")
                    .withDetail("error", e.getMessage())
                    .build();
            }
        };
    }

    /**
     * Custom health indicator for notification service
     */
    @Bean
    public HealthIndicator notificationHealthIndicator() {
        return () -> {
            try {
                // Check if notification configuration is present
                String smtpHost = System.getenv("SMTP_HOST");
                boolean emailEnabled = Boolean.parseBoolean(System.getenv("NOTIFICATION_EMAIL_ENABLED"));
                
                if (emailEnabled && (smtpHost == null || smtpHost.isEmpty())) {
                    return Health.down()
                        .withDetail("notification", "Email enabled but SMTP not configured")
                        .build();
                }
                
                return Health.up()
                    .withDetail("notification", "Configuration valid")
                    .withDetail("email_enabled", emailEnabled)
                    .build();
            } catch (Exception e) {
                return Health.down()
                    .withDetail("notification", "Configuration error")
                    .withDetail("error", e.getMessage())
                    .build();
            }
        };
    }
}