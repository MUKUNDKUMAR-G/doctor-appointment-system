package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;

/**
 * Domain model for migration execution log entries
 * Tracks detailed information about migration executions
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
public class MigrationExecutionLog {
    
    public enum Status {
        SUCCESS,
        FAILED,
        ROLLED_BACK,
        SKIPPED
    }
    
    private Long id;
    private String migrationVersion;
    private LocalDateTime executionTime;
    private Status status;
    private Long executionDurationMs;
    private String errorMessage;
    private String backupReference;
    private String checksumBefore;
    private String checksumAfter;
    private String executedBy;
    private String environment;
    
    public MigrationExecutionLog() {
        this.executionTime = LocalDateTime.now();
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMigrationVersion() {
        return migrationVersion;
    }
    
    public void setMigrationVersion(String migrationVersion) {
        this.migrationVersion = migrationVersion;
    }
    
    public LocalDateTime getExecutionTime() {
        return executionTime;
    }
    
    public void setExecutionTime(LocalDateTime executionTime) {
        this.executionTime = executionTime;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }
    
    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getBackupReference() {
        return backupReference;
    }
    
    public void setBackupReference(String backupReference) {
        this.backupReference = backupReference;
    }
    
    public String getChecksumBefore() {
        return checksumBefore;
    }
    
    public void setChecksumBefore(String checksumBefore) {
        this.checksumBefore = checksumBefore;
    }
    
    public String getChecksumAfter() {
        return checksumAfter;
    }
    
    public void setChecksumAfter(String checksumAfter) {
        this.checksumAfter = checksumAfter;
    }
    
    public String getExecutedBy() {
        return executedBy;
    }
    
    public void setExecutedBy(String executedBy) {
        this.executedBy = executedBy;
    }
    
    public String getEnvironment() {
        return environment;
    }
    
    public void setEnvironment(String environment) {
        this.environment = environment;
    }
    
    public static class Builder {
        private final MigrationExecutionLog log = new MigrationExecutionLog();
        
        public Builder migrationVersion(String migrationVersion) {
            log.migrationVersion = migrationVersion;
            return this;
        }
        
        public Builder executionTime(LocalDateTime executionTime) {
            log.executionTime = executionTime;
            return this;
        }
        
        public Builder status(Status status) {
            log.status = status;
            return this;
        }
        
        public Builder executionDurationMs(Long executionDurationMs) {
            log.executionDurationMs = executionDurationMs;
            return this;
        }
        
        public Builder errorMessage(String errorMessage) {
            log.errorMessage = errorMessage;
            return this;
        }
        
        public Builder backupReference(String backupReference) {
            log.backupReference = backupReference;
            return this;
        }
        
        public Builder checksumBefore(String checksumBefore) {
            log.checksumBefore = checksumBefore;
            return this;
        }
        
        public Builder checksumAfter(String checksumAfter) {
            log.checksumAfter = checksumAfter;
            return this;
        }
        
        public Builder executedBy(String executedBy) {
            log.executedBy = executedBy;
            return this;
        }
        
        public Builder environment(String environment) {
            log.environment = environment;
            return this;
        }
        
        public MigrationExecutionLog build() {
            return log;
        }
    }
    
    @Override
    public String toString() {
        return "MigrationExecutionLog{" +
                "id=" + id +
                ", migrationVersion='" + migrationVersion + '\'' +
                ", executionTime=" + executionTime +
                ", status=" + status +
                ", executionDurationMs=" + executionDurationMs +
                ", errorMessage='" + errorMessage + '\'' +
                ", backupReference='" + backupReference + '\'' +
                ", checksumBefore='" + checksumBefore + '\'' +
                ", checksumAfter='" + checksumAfter + '\'' +
                ", executedBy='" + executedBy + '\'' +
                ", environment='" + environment + '\'' +
                '}';
    }
}
