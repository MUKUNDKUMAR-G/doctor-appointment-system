package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result object for database backup operations
 * Contains backup status, file information, and operation details
 */
public class BackupResult {
    
    private final boolean success;
    private final String message;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    private final String backupFilePath;
    private final long backupSizeBytes;
    private final long executionTimeMs;
    private final String backupName;
    
    private BackupResult(Builder builder) {
        this.success = builder.success;
        this.message = builder.message;
        this.errors = builder.errors != null ? new ArrayList<>(builder.errors) : new ArrayList<>();
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.backupFilePath = builder.backupFilePath;
        this.backupSizeBytes = builder.backupSizeBytes;
        this.executionTimeMs = builder.executionTimeMs;
        this.backupName = builder.backupName;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Creates a successful backup result
     */
    public static BackupResult success(String message, String backupFilePath, long backupSizeBytes) {
        return builder()
            .success(true)
            .message(message)
            .backupFilePath(backupFilePath)
            .backupSizeBytes(backupSizeBytes)
            .build();
    }
    
    /**
     * Creates a failed backup result
     */
    public static BackupResult failure(String message, List<String> errors) {
        return builder()
            .success(false)
            .message(message)
            .errors(errors)
            .build();
    }
    
    /**
     * Creates a failed backup result with single error
     */
    public static BackupResult failure(String message) {
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
    
    public String getBackupFilePath() {
        return backupFilePath;
    }
    
    public long getBackupSizeBytes() {
        return backupSizeBytes;
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public String getBackupName() {
        return backupName;
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    @Override
    public String toString() {
        return "BackupResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", backupFilePath='" + backupFilePath + '\'' +
                ", backupSizeBytes=" + backupSizeBytes +
                ", executionTimeMs=" + executionTimeMs +
                ", backupName='" + backupName + '\'' +
                ", errors=" + errors +
                '}';
    }
    
    public static class Builder {
        private boolean success;
        private String message;
        private List<String> errors;
        private LocalDateTime timestamp;
        private String backupFilePath;
        private long backupSizeBytes;
        private long executionTimeMs;
        private String backupName;
        
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
        
        public Builder backupFilePath(String backupFilePath) {
            this.backupFilePath = backupFilePath;
            return this;
        }
        
        public Builder backupSizeBytes(long backupSizeBytes) {
            this.backupSizeBytes = backupSizeBytes;
            return this;
        }
        
        public Builder executionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
            return this;
        }
        
        public Builder backupName(String backupName) {
            this.backupName = backupName;
            return this;
        }
        
        public BackupResult build() {
            return new BackupResult(this);
        }
    }
}