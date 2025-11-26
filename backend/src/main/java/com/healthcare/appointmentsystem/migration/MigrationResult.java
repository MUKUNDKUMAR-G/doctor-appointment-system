package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result object for migration execution operations
 * Contains execution status, timing, and detailed information
 */
public class MigrationResult {
    
    private final boolean success;
    private final String message;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    private final long executionTimeMs;
    private final int migrationsExecuted;
    private final String currentSchemaVersion;
    
    private MigrationResult(Builder builder) {
        this.success = builder.success;
        this.message = builder.message;
        this.errors = builder.errors != null ? new ArrayList<>(builder.errors) : new ArrayList<>();
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.executionTimeMs = builder.executionTimeMs;
        this.migrationsExecuted = builder.migrationsExecuted;
        this.currentSchemaVersion = builder.currentSchemaVersion;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Creates a successful migration result
     */
    public static MigrationResult success(String message, int migrationsExecuted, long executionTimeMs) {
        return builder()
            .success(true)
            .message(message)
            .migrationsExecuted(migrationsExecuted)
            .executionTimeMs(executionTimeMs)
            .build();
    }
    
    /**
     * Creates a failed migration result
     */
    public static MigrationResult failure(String message, List<String> errors) {
        return builder()
            .success(false)
            .message(message)
            .errors(errors)
            .build();
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public List<String> getErrors() {
        return new ArrayList<>(errors);
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public int getMigrationsExecuted() {
        return migrationsExecuted;
    }
    
    public String getCurrentSchemaVersion() {
        return currentSchemaVersion;
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    @Override
    public String toString() {
        return "MigrationResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", executionTimeMs=" + executionTimeMs +
                ", migrationsExecuted=" + migrationsExecuted +
                ", currentSchemaVersion='" + currentSchemaVersion + '\'' +
                ", errors=" + errors +
                '}';
    }
    
    public static class Builder {
        private boolean success;
        private String message;
        private List<String> errors;
        private LocalDateTime timestamp;
        private long executionTimeMs;
        private int migrationsExecuted;
        private String currentSchemaVersion;
        
        public Builder success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder errors(List<String> errors) {
            this.errors = errors;
            return this;
        }
        
        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public Builder executionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
            return this;
        }
        
        public Builder migrationsExecuted(int migrationsExecuted) {
            this.migrationsExecuted = migrationsExecuted;
            return this;
        }
        
        public Builder currentSchemaVersion(String currentSchemaVersion) {
            this.currentSchemaVersion = currentSchemaVersion;
            return this;
        }
        
        public MigrationResult build() {
            return new MigrationResult(this);
        }
    }
}