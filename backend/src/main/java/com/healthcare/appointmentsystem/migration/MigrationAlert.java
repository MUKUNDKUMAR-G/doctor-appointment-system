package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a migration alert
 * Contains alert details for notification systems
 * 
 * Requirements addressed:
 * - 4.1: Generate detailed error reports
 * - 4.2: Send alerts to administrators
 */
public class MigrationAlert {
    
    public enum Severity {
        INFO, WARNING, CRITICAL
    }
    
    public enum AlertType {
        MIGRATION_FAILURE,
        CHECKSUM_MISMATCH,
        VALIDATION_ERROR,
        BACKUP_FAILURE,
        ROLLBACK_TRIGGERED,
        PERFORMANCE_DEGRADATION
    }
    
    private final AlertType type;
    private final Severity severity;
    private final String title;
    private final String message;
    private final LocalDateTime timestamp;
    private final List<String> details;
    private final String affectedMigration;
    
    private MigrationAlert(Builder builder) {
        this.type = builder.type;
        this.severity = builder.severity;
        this.title = builder.title;
        this.message = builder.message;
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.details = builder.details != null ? new ArrayList<>(builder.details) : new ArrayList<>();
        this.affectedMigration = builder.affectedMigration;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public AlertType getType() {
        return type;
    }
    
    public Severity getSeverity() {
        return severity;
    }
    
    public String getTitle() {
        return title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public List<String> getDetails() {
        return new ArrayList<>(details);
    }
    
    public String getAffectedMigration() {
        return affectedMigration;
    }
    
    @Override
    public String toString() {
        return String.format("[%s] %s - %s: %s (Migration: %s, Time: %s)",
            severity, type, title, message, affectedMigration, timestamp);
    }
    
    public static class Builder {
        private AlertType type;
        private Severity severity;
        private String title;
        private String message;
        private LocalDateTime timestamp;
        private List<String> details;
        private String affectedMigration;
        
        public Builder type(AlertType type) {
            this.type = type;
            return this;
        }
        
        public Builder severity(Severity severity) {
            this.severity = severity;
            return this;
        }
        
        public Builder title(String title) {
            this.title = title;
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
        
        public Builder details(List<String> details) {
            this.details = details;
            return this;
        }
        
        public Builder addDetail(String detail) {
            if (this.details == null) {
                this.details = new ArrayList<>();
            }
            this.details.add(detail);
            return this;
        }
        
        public Builder affectedMigration(String affectedMigration) {
            this.affectedMigration = affectedMigration;
            return this;
        }
        
        public MigrationAlert build() {
            return new MigrationAlert(this);
        }
    }
}
