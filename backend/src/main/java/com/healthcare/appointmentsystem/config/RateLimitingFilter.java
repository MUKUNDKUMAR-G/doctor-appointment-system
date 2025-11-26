package com.healthcare.appointmentsystem.config;

import com.healthcare.appointmentsystem.service.SecurityAuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private SecurityProperties securityProperties;

    @Autowired
    private SecurityAuditService securityAuditService;

    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastResetTime = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!securityProperties.isEnableRateLimiting()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIpAddress(request);
        long currentTime = System.currentTimeMillis();
        
        // Reset counter every minute
        lastResetTime.compute(clientIp, (key, lastReset) -> {
            if (lastReset == null || currentTime - lastReset > 60000) { // 1 minute
                requestCounts.put(key, new AtomicInteger(0));
                return currentTime;
            }
            return lastReset;
        });

        AtomicInteger count = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        
        if (count.incrementAndGet() > securityProperties.getRateLimitRequestsPerMinute()) {
            securityAuditService.logRateLimitExceeded(clientIp, request.getRequestURI());
            response.setStatus(429); // HTTP 429 Too Many Requests
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            response.setContentType("application/json");
            return;
        }

        filterChain.doFilter(request, response);
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