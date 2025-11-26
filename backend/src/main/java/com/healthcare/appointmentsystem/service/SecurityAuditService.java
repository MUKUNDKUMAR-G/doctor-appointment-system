package com.healthcare.appointmentsystem.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class SecurityAuditService {

    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY_AUDIT");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void logSuccessfulLogin(String username, String ipAddress) {
        securityLogger.info("SUCCESSFUL_LOGIN - User: {} | IP: {} | Time: {}", 
            username, ipAddress, LocalDateTime.now().format(formatter));
    }

    public void logFailedLogin(String username, String ipAddress, String reason) {
        securityLogger.warn("FAILED_LOGIN - User: {} | IP: {} | Reason: {} | Time: {}", 
            username, ipAddress, reason, LocalDateTime.now().format(formatter));
    }

    public void logAccountLockout(String username, String ipAddress) {
        securityLogger.warn("ACCOUNT_LOCKOUT - User: {} | IP: {} | Time: {}", 
            username, ipAddress, LocalDateTime.now().format(formatter));
    }

    public void logPasswordChange(String username, String ipAddress) {
        securityLogger.info("PASSWORD_CHANGE - User: {} | IP: {} | Time: {}", 
            username, ipAddress, LocalDateTime.now().format(formatter));
    }

    public void logUnauthorizedAccess(String username, String resource, String ipAddress) {
        securityLogger.warn("UNAUTHORIZED_ACCESS - User: {} | Resource: {} | IP: {} | Time: {}", 
            username, resource, ipAddress, LocalDateTime.now().format(formatter));
    }

    public void logRateLimitExceeded(String ipAddress, String endpoint) {
        securityLogger.warn("RATE_LIMIT_EXCEEDED - IP: {} | Endpoint: {} | Time: {}", 
            ipAddress, endpoint, LocalDateTime.now().format(formatter));
    }

    public void logSuspiciousActivity(String username, String activity, String ipAddress) {
        securityLogger.warn("SUSPICIOUS_ACTIVITY - User: {} | Activity: {} | IP: {} | Time: {}", 
            username, activity, ipAddress, LocalDateTime.now().format(formatter));
    }

    public void logDataAccess(String username, String dataType, String action, String ipAddress) {
        securityLogger.info("DATA_ACCESS - User: {} | DataType: {} | Action: {} | IP: {} | Time: {}", 
            username, dataType, action, ipAddress, LocalDateTime.now().format(formatter));
    }
}