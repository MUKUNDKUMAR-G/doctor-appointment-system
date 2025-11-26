package com.healthcare.appointmentsystem.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {
    
    private boolean httpsOnly = false;
    private int maxLoginAttempts = 5;
    private long lockoutDurationMinutes = 15;
    private boolean enableRateLimiting = true;
    private int rateLimitRequestsPerMinute = 100;
    private PasswordPolicy passwordPolicy = new PasswordPolicy();
    private Session session = new Session();
    
    // Getters and Setters
    public boolean isHttpsOnly() {
        return httpsOnly;
    }
    
    public void setHttpsOnly(boolean httpsOnly) {
        this.httpsOnly = httpsOnly;
    }
    
    public int getMaxLoginAttempts() {
        return maxLoginAttempts;
    }
    
    public void setMaxLoginAttempts(int maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }
    
    public long getLockoutDurationMinutes() {
        return lockoutDurationMinutes;
    }
    
    public void setLockoutDurationMinutes(long lockoutDurationMinutes) {
        this.lockoutDurationMinutes = lockoutDurationMinutes;
    }
    
    public boolean isEnableRateLimiting() {
        return enableRateLimiting;
    }
    
    public void setEnableRateLimiting(boolean enableRateLimiting) {
        this.enableRateLimiting = enableRateLimiting;
    }
    
    public int getRateLimitRequestsPerMinute() {
        return rateLimitRequestsPerMinute;
    }
    
    public void setRateLimitRequestsPerMinute(int rateLimitRequestsPerMinute) {
        this.rateLimitRequestsPerMinute = rateLimitRequestsPerMinute;
    }
    
    public PasswordPolicy getPasswordPolicy() {
        return passwordPolicy;
    }
    
    public void setPasswordPolicy(PasswordPolicy passwordPolicy) {
        this.passwordPolicy = passwordPolicy;
    }
    
    public Session getSession() {
        return session;
    }
    
    public void setSession(Session session) {
        this.session = session;
    }
    
    // Nested classes for configuration
    public static class PasswordPolicy {
        private int minLength = 8;
        private boolean requireUppercase = true;
        private boolean requireLowercase = true;
        private boolean requireDigits = true;
        private boolean requireSpecialChars = true;
        
        public int getMinLength() {
            return minLength;
        }
        
        public void setMinLength(int minLength) {
            this.minLength = minLength;
        }
        
        public boolean isRequireUppercase() {
            return requireUppercase;
        }
        
        public void setRequireUppercase(boolean requireUppercase) {
            this.requireUppercase = requireUppercase;
        }
        
        public boolean isRequireLowercase() {
            return requireLowercase;
        }
        
        public void setRequireLowercase(boolean requireLowercase) {
            this.requireLowercase = requireLowercase;
        }
        
        public boolean isRequireDigits() {
            return requireDigits;
        }
        
        public void setRequireDigits(boolean requireDigits) {
            this.requireDigits = requireDigits;
        }
        
        public boolean isRequireSpecialChars() {
            return requireSpecialChars;
        }
        
        public void setRequireSpecialChars(boolean requireSpecialChars) {
            this.requireSpecialChars = requireSpecialChars;
        }
    }
    
    public static class Session {
        private int timeoutMinutes = 30;
        private int maxConcurrentSessions = 3;
        
        public int getTimeoutMinutes() {
            return timeoutMinutes;
        }
        
        public void setTimeoutMinutes(int timeoutMinutes) {
            this.timeoutMinutes = timeoutMinutes;
        }
        
        public int getMaxConcurrentSessions() {
            return maxConcurrentSessions;
        }
        
        public void setMaxConcurrentSessions(int maxConcurrentSessions) {
            this.maxConcurrentSessions = maxConcurrentSessions;
        }
    }
}