package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result object for migration rollback operations
 * Contains rollback status, operation details, and error information
 * 
 * Requirements addressed:
 * - 2.3: Automatic rollback on migration failure
 * - 2.4: Manual rollback capabilities and point-in-time rollback
 */
public class RollbackResult {
    
    private final boolean success;
    private final String message;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    private final String rollbackType;
    private final String targetVersion;
    private final String backupUsed;
    private final long executionTimeMs;
    private final List<String> operationsPerformed;
    
    private RollbackResult(Builder builder) {
        this.success = builder.success;
        this.message = builder.message;
        this.errors = builder.errors != null ? new ArrayList<>(builder.errors) : new ArrayList<>();
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.rollbackType = builder.rollbackType;
        this.targetVersion = builder.targetVersion;
        this.backupUsed = builder.backupUsed;
        this.executionTimeMs = builder.executionTimeMs;
        this.operationsPerformed = builder.operationsPerformed != null ? 
            new ArrayList<>(builder.operationsPerformed) : new ArrayList<>();
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Creates a successful rollback result
     */
    public static RollbackResult success(String message, String rollbackType, String targetVersion) {
        return builder()
            .success(true)
            .message(message)
            .rollbackType(rollbackType)
            .targetVersion(targetVersion)
            .build();
    }
    
    /**
     * Creates a failed rollback result
     */
    public static RollbackResult failure(String message, List<String> errors) {
        return builder()
            .success(false)
            .message(message)
            .errors(errors)
            .build();
    }
    
    /**
     * Creates a failed rollback result with single error
     */
    public static RollbackResult failure(String message) {
        return failure(message, List.of(message));
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
    
    public String getRollbackType() {
        return rollbackType;
    }
    
    public String getTargetVersion() {
        return targetVersion;
    }
    
    public String getBackupUsed() {
        return backupUsed;
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public List<String> getOperationsPerformed() {
        return new ArrayList<>(operationsPerformed);
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    @Override
    public String toString() {
        return "RollbackResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", rollbackType='" + rollbackType + '\'' +
                ", targetVersion='" + targetVersion + '\'' +
                ", backupUsed='" + backupUsed + '\'' +
                ", executionTimeMs=" + executionTimeMs +
                ", operationsPerformed=" + operationsPerformed +
                ", errors=" + errors +
                '}';
    }
    
    public static class Builder {
        private boolean success;
        private String message;
        private List<String> errors;
        private LocalDateTime timestamp;
        private String rollbackType;
        private String targetVersion;
        private String backupUsed;
        private long executionTimeMs;
        private List<String> operationsPerformed;
        
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
        
        public Builder rollbackType(String rollbackType) {
            this.rollbackType = rollbackType;
            return this;
        }
        
        public Builder targetVersion(String targetVersion) {
            this.targetVersion = targetVersion;
            return this;
        }
        
        public Builder backupUsed(String backupUsed) {
            this.backupUsed = backupUsed;
            return this;
        }
        
        public Builder executionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
            return this;
        }
        
        public Builder operationsPerformed(List<String> operationsPerformed) {
            this.operationsPerformed = operationsPerformed;
            return this;
        }
        
        public RollbackResult build() {
            return new RollbackResult(this);
        }
    }
}