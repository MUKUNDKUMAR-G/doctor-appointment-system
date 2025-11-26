package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for logging migration execution details
 * Provides detailed tracking and error analysis capabilities
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
@Service
public class MigrationExecutionLogger {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationExecutionLogger.class);
    
    @Autowired
    private MigrationExecutionLogRepository logRepository;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    
    /**
     * Logs a successful migration execution
     * 
     * @param migrationVersion The version of the migration
     * @param executionDurationMs Duration of execution in milliseconds
     * @param checksumBefore Checksum before migration
     * @param checksumAfter Checksum after migration
     * @param backupReference Reference to backup if created
     */
    public void logSuccess(String migrationVersion, Long executionDurationMs, 
                          String checksumBefore, String checksumAfter, String backupReference) {
        try {
            MigrationExecutionLog log = MigrationExecutionLog.builder()
                    .migrationVersion(migrationVersion)
                    .executionTime(LocalDateTime.now())
                    .status(MigrationExecutionLog.Status.SUCCESS)
                    .executionDurationMs(executionDurationMs)
                    .checksumBefore(checksumBefore)
                    .checksumAfter(checksumAfter)
                    .backupReference(backupReference)
                    .executedBy(System.getProperty("user.name"))
                    .environment(activeProfile)
                    .build();
            
            logRepository.save(log);
            
            logger.info("Logged successful migration execution: V{} in {}ms", 
                    migrationVersion, executionDurationMs);
            
        } catch (Exception e) {
            logger.error("Failed to log migration success for V{}: {}", 
                    migrationVersion, e.getMessage(), e);
        }
    }
    
    /**
     * Logs a failed migration execution
     * 
     * @param migrationVersion The version of the migration
     * @param executionDurationMs Duration of execution in milliseconds
     * @param errorMessage Error message describing the failure
     * @param backupReference Reference to backup if created
     */
    public void logFailure(String migrationVersion, Long executionDurationMs, 
                          String errorMessage, String backupReference) {
        try {
            MigrationExecutionLog log = MigrationExecutionLog.builder()
                    .migrationVersion(migrationVersion)
                    .executionTime(LocalDateTime.now())
                    .status(MigrationExecutionLog.Status.FAILED)
                    .executionDurationMs(executionDurationMs)
                    .errorMessage(errorMessage)
                    .backupReference(backupReference)
                    .executedBy(System.getProperty("user.name"))
                    .environment(activeProfile)
                    .build();
            
            logRepository.save(log);
            
            logger.error("Logged failed migration execution: V{} - {}", 
                    migrationVersion, errorMessage);
            
        } catch (Exception e) {
            logger.error("Failed to log migration failure for V{}: {}", 
                    migrationVersion, e.getMessage(), e);
        }
    }
    
    /**
     * Logs a rolled back migration
     * 
     * @param migrationVersion The version of the migration
     * @param executionDurationMs Duration of execution in milliseconds
     * @param errorMessage Error message that triggered rollback
     * @param backupReference Reference to backup used for rollback
     */
    public void logRollback(String migrationVersion, Long executionDurationMs, 
                           String errorMessage, String backupReference) {
        try {
            MigrationExecutionLog log = MigrationExecutionLog.builder()
                    .migrationVersion(migrationVersion)
                    .executionTime(LocalDateTime.now())
                    .status(MigrationExecutionLog.Status.ROLLED_BACK)
                    .executionDurationMs(executionDurationMs)
                    .errorMessage(errorMessage)
                    .backupReference(backupReference)
                    .executedBy(System.getProperty("user.name"))
                    .environment(activeProfile)
                    .build();
            
            logRepository.save(log);
            
            logger.warn("Logged rolled back migration: V{} - {}", 
                    migrationVersion, errorMessage);
            
        } catch (Exception e) {
            logger.error("Failed to log migration rollback for V{}: {}", 
                    migrationVersion, e.getMessage(), e);
        }
    }
    
    /**
     * Logs a skipped migration
     * 
     * @param migrationVersion The version of the migration
     * @param reason Reason for skipping
     */
    public void logSkipped(String migrationVersion, String reason) {
        try {
            MigrationExecutionLog log = MigrationExecutionLog.builder()
                    .migrationVersion(migrationVersion)
                    .executionTime(LocalDateTime.now())
                    .status(MigrationExecutionLog.Status.SKIPPED)
                    .errorMessage(reason)
                    .executedBy(System.getProperty("user.name"))
                    .environment(activeProfile)
                    .build();
            
            logRepository.save(log);
            
            logger.info("Logged skipped migration: V{} - {}", migrationVersion, reason);
            
        } catch (Exception e) {
            logger.error("Failed to log skipped migration for V{}: {}", 
                    migrationVersion, e.getMessage(), e);
        }
    }
    
    /**
     * Generates an error analysis report for failed migrations
     * Requirement 4.2: Generate detailed error reports
     * 
     * @return Error analysis report
     */
    public ErrorAnalysisReport generateErrorAnalysisReport() {
        try {
            List<MigrationExecutionLog> failedExecutions = logRepository.findFailedExecutions();
            
            ErrorAnalysisReport report = new ErrorAnalysisReport();
            report.setTotalFailures(failedExecutions.size());
            report.setFailedExecutions(failedExecutions);
            
            // Analyze common error patterns
            for (MigrationExecutionLog log : failedExecutions) {
                String errorMessage = log.getErrorMessage();
                if (errorMessage != null) {
                    if (errorMessage.contains("checksum")) {
                        report.incrementChecksumErrors();
                    } else if (errorMessage.contains("syntax")) {
                        report.incrementSyntaxErrors();
                    } else if (errorMessage.contains("timeout")) {
                        report.incrementTimeoutErrors();
                    } else if (errorMessage.contains("connection")) {
                        report.incrementConnectionErrors();
                    } else {
                        report.incrementOtherErrors();
                    }
                }
            }
            
            logger.info("Generated error analysis report: {} total failures", failedExecutions.size());
            
            return report;
            
        } catch (Exception e) {
            logger.error("Failed to generate error analysis report: {}", e.getMessage(), e);
            return new ErrorAnalysisReport();
        }
    }
    
    /**
     * Gets execution history for a specific migration version
     * 
     * @param migrationVersion The migration version
     * @return List of execution log entries
     */
    public List<MigrationExecutionLog> getExecutionHistory(String migrationVersion) {
        return logRepository.findByMigrationVersion(migrationVersion);
    }
    
    /**
     * Gets the latest execution log for a migration version
     * 
     * @param migrationVersion The migration version
     * @return Latest execution log entry, or null if none found
     */
    public MigrationExecutionLog getLatestExecution(String migrationVersion) {
        return logRepository.findLatestByMigrationVersion(migrationVersion);
    }
}
