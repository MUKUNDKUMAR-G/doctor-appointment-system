package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Health status object for migration system monitoring
 * Contains system health information and diagnostic details
 */
public class HealthStatus {
    
    public enum Status {
        HEALTHY, DEGRADED, UNHEALTHY
    }
    
    private final Status status;
    private final String message;
    private final LocalDateTime timestamp;
    private final Map<String, Object> details;
    private final List<String> issues;
    
    private HealthStatus(Builder builder) {
        this.status = builder.status;
        this.message = builder.message;
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.details = builder.details != null ? new HashMap<>(builder.details) : new HashMap<>();
        this.issues = builder.issues != null ? new ArrayList<>(builder.issues) : new ArrayList<>();
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Creates a healthy status
     */
    public static HealthStatus healthy(String message) {
        return builder()
            .status(Status.HEALTHY)
            .message(message)
            .build();
    }
    
    /**
     * Creates a degraded status
     */
    public static HealthStatus degraded(String message, List<String> issues) {
        return builder()
            .status(Status.DEGRADED)
            .message(message)
            .issues(issues)
            .build();
    }
    
    /**
     * Creates an unhealthy status
     */
    public static HealthStatus unhealthy(String message, List<String> issues) {
        return builder()
            .status(Status.UNHEALTHY)
            .message(message)
            .issues(issues)
            .build();
    }
    
    public Status getStatus() {
        return status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public Map<String, Object> getDetails() {
        return new HashMap<>(details);
    }
    
    public List<String> getIssues() {
        return new ArrayList<>(issues);
    }
    
    public boolean isHealthy() {
        return status == Status.HEALTHY;
    }
    
    public boolean isDegraded() {
        return status == Status.DEGRADED;
    }
    
    public boolean isUnhealthy() {
        return status == Status.UNHEALTHY;
    }
    
    @Override
    public String toString() {
        return "HealthStatus{" +
                "status=" + status +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", details=" + details +
                ", issues=" + issues +
                '}';
    }
    
    public static class Builder {
        private Status status;
        private String message;
        private LocalDateTime timestamp;
        private Map<String, Object> details;
        private List<String> issues;
        
        public Builder status(Status status) {
            this.status = status;
            return this;
        }
        
        public Builder message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public Builder details(Map<String, Object> details) {
            this.details = details;
            return this;
        }
        
        public Builder addDetail(String key, Object value) {
            if (this.details == null) {
                this.details = new HashMap<>();
            }
            this.details.put(key, value);
            return this;
        }
        
        public Builder issues(List<String> issues) {
            this.issues = issues;
            return this;
        }
        
        public Builder addIssue(String issue) {
            if (this.issues == null) {
                this.issues = new ArrayList<>();
            }
            this.issues.add(issue);
            return this;
        }
        
        public HealthStatus build() {
            return new HealthStatus(this);
        }
    }
}