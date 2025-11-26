package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Logging-based alert notification service
 * Logs alerts to application logs (default implementation)
 * 
 * Requirements addressed:
 * - 4.1: Log all migration activities with timestamps and status
 * - 4.2: Generate detailed error reports
 */
@Component
public class LoggingAlertNotificationService implements AlertNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingAlertNotificationService.class);
    private static final Logger alertLogger = LoggerFactory.getLogger("migration.alerts");
    
    @Override
    public boolean sendAlert(MigrationAlert alert) {
        try {
            // Log to both standard logger and dedicated alert logger
            String logMessage = formatAlertMessage(alert);
            
            switch (alert.getSeverity()) {
                case CRITICAL:
                    logger.error(logMessage);
                    alertLogger.error(logMessage);
                    break;
                case WARNING:
                    logger.warn(logMessage);
                    alertLogger.warn(logMessage);
                    break;
                case INFO:
                    logger.info(logMessage);
                    alertLogger.info(logMessage);
                    break;
            }
            
            // Log details if present
            if (!alert.getDetails().isEmpty()) {
                alertLogger.info("Alert details:");
                for (String detail : alert.getDetails()) {
                    alertLogger.info("  - {}", detail);
                }
            }
            
            return true;
        } catch (Exception e) {
            logger.error("Failed to log alert", e);
            return false;
        }
    }
    
    @Override
    public int sendAlerts(List<MigrationAlert> alerts) {
        int successCount = 0;
        for (MigrationAlert alert : alerts) {
            if (sendAlert(alert)) {
                successCount++;
            }
        }
        return successCount;
    }
    
    @Override
    public boolean isEnabled() {
        return true; // Always enabled
    }
    
    private String formatAlertMessage(MigrationAlert alert) {
        return String.format("[MIGRATION ALERT] [%s] [%s] %s - %s | Migration: %s | Time: %s",
            alert.getSeverity(),
            alert.getType(),
            alert.getTitle(),
            alert.getMessage(),
            alert.getAffectedMigration() != null ? alert.getAffectedMigration() : "N/A",
            alert.getTimestamp()
        );
    }
}
