package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for migration execution log operations
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
public interface MigrationExecutionLogRepository {
    
    /**
     * Saves a migration execution log entry
     * 
     * @param log The log entry to save
     * @return The saved log entry with generated ID
     */
    MigrationExecutionLog save(MigrationExecutionLog log);
    
    /**
     * Finds all log entries for a specific migration version
     * 
     * @param migrationVersion The migration version to search for
     * @return List of log entries for the specified version
     */
    List<MigrationExecutionLog> findByMigrationVersion(String migrationVersion);
    
    /**
     * Finds all log entries with a specific status
     * 
     * @param status The status to search for
     * @return List of log entries with the specified status
     */
    List<MigrationExecutionLog> findByStatus(MigrationExecutionLog.Status status);
    
    /**
     * Finds all log entries within a time range
     * 
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @return List of log entries within the time range
     */
    List<MigrationExecutionLog> findByExecutionTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Finds the most recent log entry for a specific migration version
     * 
     * @param migrationVersion The migration version to search for
     * @return The most recent log entry, or null if none found
     */
    MigrationExecutionLog findLatestByMigrationVersion(String migrationVersion);
    
    /**
     * Finds all failed migration executions
     * 
     * @return List of failed migration log entries
     */
    List<MigrationExecutionLog> findFailedExecutions();
    
    /**
     * Counts the number of executions for a specific migration version
     * 
     * @param migrationVersion The migration version to count
     * @return Number of executions
     */
    long countByMigrationVersion(String migrationVersion);
}
