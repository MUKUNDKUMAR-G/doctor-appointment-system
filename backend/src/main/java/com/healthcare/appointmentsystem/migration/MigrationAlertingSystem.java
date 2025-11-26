package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Central alerting system for migration operations
 * Manages alert generation, escalation, and notification
 * 
 * Requirements addressed:
 * - 4.1: Log all migration activities with timestamps and status
 * - 4.2: Generate detailed error reports and send alerts
 */
@Component
public class MigrationAlertingSystem {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationAlertingSystem.class);
    
    private final List<AlertNotificationService> notificationServices;
    private final List<MigrationAlert> alertHistory;
    
    // Escalation thresholds
    private static final int CRITICAL_FAILURE_THRESHOLD = 3;
    private static final int WARNING_CHECKSUM_THRESHOLD = 5;
    
    public MigrationAlertingSystem(List<AlertNotificationService> notificationServices) {
        this.notificationServices = notificationServices != null ? 
            new ArrayList<>(notificationServices) : new ArrayList<>();
        this.alertHistory = new CopyOnWriteArrayList<>();
        
        logger.info("Migration alerting system initialized with {} notification service(s)", 
            this.notificationServices.size());
    }
    
    /**
     * Sends an alert for migration failure
     * Requirement 4.2: Generate detailed error reports
     */
    public void alertMigrationFailure(String migrationVersion, String errorMessage, List<String> details) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.MIGRATION_FAILURE)
            .severity(MigrationAlert.Severity.CRITICAL)
            .title("Migration Execution Failed")
            .message("Migration " + migrationVersion + " failed: " + errorMessage)
            .affectedMigration(migrationVersion)
            .details(details)
            .build();
        
        sendAlert(alert);
        checkEscalation(MigrationAlert.AlertType.MIGRATION_FAILURE);
    }
    
    /**
     * Sends an alert for checksum mismatch
     */
    public void alertChecksumMismatch(String migrationVersion, String details) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.CHECKSUM_MISMATCH)
            .severity(MigrationAlert.Severity.WARNING)
            .title("Migration Checksum Mismatch Detected")
            .message("Checksum mismatch detected for migration " + migrationVersion)
            .affectedMigration(migrationVersion)
            .addDetail(details)
            .build();
        
        sendAlert(alert);
        checkEscalation(MigrationAlert.AlertType.CHECKSUM_MISMATCH);
    }
    
    /**
     * Sends an alert for validation errors
     */
    public void alertValidationError(String message, List<String> errors) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.VALIDATION_ERROR)
            .severity(MigrationAlert.Severity.WARNING)
            .title("Migration Validation Error")
            .message(message)
            .details(errors)
            .build();
        
        sendAlert(alert);
    }
    
    /**
     * Sends an alert for backup failures
     */
    public void alertBackupFailure(String errorMessage) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.BACKUP_FAILURE)
            .severity(MigrationAlert.Severity.CRITICAL)
            .title("Database Backup Failed")
            .message("Failed to create database backup: " + errorMessage)
            .build();
        
        sendAlert(alert);
    }
    
    /**
     * Sends an alert for rollback operations
     */
    public void alertRollbackTriggered(String migrationVersion, String reason) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.ROLLBACK_TRIGGERED)
            .severity(MigrationAlert.Severity.CRITICAL)
            .title("Migration Rollback Triggered")
            .message("Rollback initiated for migration " + migrationVersion + ": " + reason)
            .affectedMigration(migrationVersion)
            .build();
        
        sendAlert(alert);
    }
    
    /**
     * Sends an alert for performance degradation
     */
    public void alertPerformanceDegradation(long executionTimeMs, long thresholdMs) {
        MigrationAlert alert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.PERFORMANCE_DEGRADATION)
            .severity(MigrationAlert.Severity.WARNING)
            .title("Migration Performance Degradation")
            .message(String.format("Migration execution took %d ms (threshold: %d ms)", 
                executionTimeMs, thresholdMs))
            .addDetail("Execution time: " + executionTimeMs + " ms")
            .addDetail("Threshold: " + thresholdMs + " ms")
            .addDetail("Exceeded by: " + (executionTimeMs - thresholdMs) + " ms")
            .build();
        
        sendAlert(alert);
    }
    
    /**
     * Sends an alert through all enabled notification services
     */
    private void sendAlert(MigrationAlert alert) {
        logger.debug("Sending alert: {}", alert);
        
        // Add to history
        alertHistory.add(alert);
        
        // Send through all enabled notification services
        int successCount = 0;
        for (AlertNotificationService service : notificationServices) {
            if (service.isEnabled()) {
                try {
                    if (service.sendAlert(alert)) {
                        successCount++;
                    }
                } catch (Exception e) {
                    logger.error("Failed to send alert through service: " + service.getClass().getSimpleName(), e);
                }
            }
        }
        
        logger.debug("Alert sent through {}/{} notification service(s)", 
            successCount, notificationServices.size());
    }
    
    /**
     * Checks if escalation is needed based on alert frequency
     * Requirement 4.2: Create escalation procedures for critical failures
     */
    private void checkEscalation(MigrationAlert.AlertType alertType) {
        // Count recent alerts of this type (last hour)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentAlertCount = alertHistory.stream()
            .filter(alert -> alert.getType() == alertType)
            .filter(alert -> alert.getTimestamp().isAfter(oneHourAgo))
            .count();
        
        // Check escalation thresholds
        if (alertType == MigrationAlert.AlertType.MIGRATION_FAILURE && 
            recentAlertCount >= CRITICAL_FAILURE_THRESHOLD) {
            escalateCriticalFailure(recentAlertCount);
        } else if (alertType == MigrationAlert.AlertType.CHECKSUM_MISMATCH && 
                   recentAlertCount >= WARNING_CHECKSUM_THRESHOLD) {
            escalateChecksumIssues(recentAlertCount);
        }
    }
    
    /**
     * Escalates critical migration failures
     */
    private void escalateCriticalFailure(long failureCount) {
        MigrationAlert escalationAlert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.MIGRATION_FAILURE)
            .severity(MigrationAlert.Severity.CRITICAL)
            .title("ESCALATION: Multiple Migration Failures")
            .message(String.format("CRITICAL: %d migration failures detected in the last hour. " +
                "Immediate attention required!", failureCount))
            .addDetail("Failure count: " + failureCount)
            .addDetail("Time window: Last 1 hour")
            .addDetail("Action required: Investigate migration issues immediately")
            .build();
        
        sendAlert(escalationAlert);
        logger.error("ESCALATION: Multiple migration failures detected - {} failures in last hour", 
            failureCount);
    }
    
    /**
     * Escalates checksum mismatch issues
     */
    private void escalateChecksumIssues(long mismatchCount) {
        MigrationAlert escalationAlert = MigrationAlert.builder()
            .type(MigrationAlert.AlertType.CHECKSUM_MISMATCH)
            .severity(MigrationAlert.Severity.WARNING)
            .title("ESCALATION: Multiple Checksum Mismatches")
            .message(String.format("WARNING: %d checksum mismatches detected in the last hour. " +
                "Review migration files for unauthorized changes.", mismatchCount))
            .addDetail("Mismatch count: " + mismatchCount)
            .addDetail("Time window: Last 1 hour")
            .addDetail("Action required: Review migration file integrity")
            .build();
        
        sendAlert(escalationAlert);
        logger.warn("ESCALATION: Multiple checksum mismatches detected - {} mismatches in last hour", 
            mismatchCount);
    }
    
    /**
     * Gets alert history
     */
    public List<MigrationAlert> getAlertHistory() {
        return new ArrayList<>(alertHistory);
    }
    
    /**
     * Gets recent alerts (last N alerts)
     */
    public List<MigrationAlert> getRecentAlerts(int count) {
        int size = alertHistory.size();
        int fromIndex = Math.max(0, size - count);
        return new ArrayList<>(alertHistory.subList(fromIndex, size));
    }
    
    /**
     * Gets alerts by severity
     */
    public List<MigrationAlert> getAlertsBySeverity(MigrationAlert.Severity severity) {
        return alertHistory.stream()
            .filter(alert -> alert.getSeverity() == severity)
            .toList();
    }
    
    /**
     * Clears alert history
     */
    public void clearAlertHistory() {
        alertHistory.clear();
        logger.info("Alert history cleared");
    }
}
