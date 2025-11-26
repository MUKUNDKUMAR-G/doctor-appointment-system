package com.healthcare.appointmentsystem.migration;

/**
 * Central orchestrator for all migration operations
 * Provides a unified interface for migration execution, validation, and repair
 * 
 * Requirements addressed:
 * - 1.1: Detect and resolve checksum mismatches automatically
 * - 1.5: Complete startup migration validation within 30 seconds
 * - 3.1: Enforce sequential version numbering for all migration files
 */
public interface MigrationManager {
    
    /**
     * Executes all pending migrations
     * Requirement 1.1: Migration execution workflow
     * 
     * @return MigrationResult containing execution details
     */
    MigrationResult executeMigrations();
    
    /**
     * Validates all migrations without executing them
     * Requirement 1.5: Complete startup migration validation within 30 seconds
     * 
     * @return ValidationResult containing validation status
     */
    MigrationValidationResult validateMigrations();
    
    /**
     * Repairs schema history to resolve checksum mismatches
     * Requirement 1.1: Detect and resolve checksum mismatches automatically
     * 
     * @return RepairResult containing repair operation details
     */
    RepairResult repairSchemaHistory();
    
    /**
     * Creates a backup before migration execution
     * Requirement 2.1: Create automatic backups before schema changes
     * 
     * @return BackupResult containing backup operation details
     */
    BackupResult createPreMigrationBackup();
    
    /**
     * Gets the current health status of the migration system
     * Requirement 4.1: Log all migration activities with timestamps and status
     * 
     * @return HealthStatus containing system health information
     */
    HealthStatus getHealthStatus();
    
    /**
     * Executes migrations with automatic backup and repair if needed
     * This is the main orchestration method that combines all operations
     * 
     * @return MigrationResult containing the complete operation result
     */
    MigrationResult executeWithSafeguards();
    
    /**
     * Performs a dry-run of pending migrations
     * Validates migrations without executing them and provides impact analysis
     * Requirement 2.4: Support dry-run mode for testing migrations without applying changes
     * 
     * @return DryRunResult containing validation results and impact analysis
     */
    DryRunResult performDryRun();
}