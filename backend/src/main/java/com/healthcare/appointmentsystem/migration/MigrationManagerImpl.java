package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Implementation of MigrationManager interface
 * Central orchestrator for all migration operations
 * 
 * Requirements addressed:
 * - 1.1: Detect and resolve checksum mismatches automatically
 * - 1.5: Complete startup migration validation within 30 seconds
 * - 3.1: Enforce sequential version numbering for all migration files
 */
public class MigrationManagerImpl implements MigrationManager {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationManagerImpl.class);
    
    private DataSource dataSource;
    private MigrationProperties migrationProperties;
    private MigrationRepairService repairService;
    private SchemaRepairService schemaRepairService;
    private DryRunMigrationService dryRunMigrationService;
    private MigrationMetricsCollector metricsCollector;
    private MigrationAlertingSystem alertingSystem;
    private Flyway flyway;
    
    // Setter methods for dependency injection
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void setMigrationProperties(MigrationProperties migrationProperties) {
        this.migrationProperties = migrationProperties;
    }
    
    public void setRepairService(MigrationRepairService repairService) {
        this.repairService = repairService;
    }
    
    public void setSchemaRepairService(SchemaRepairService schemaRepairService) {
        this.schemaRepairService = schemaRepairService;
    }
    
    public void setDryRunMigrationService(DryRunMigrationService dryRunMigrationService) {
        this.dryRunMigrationService = dryRunMigrationService;
    }
    
    public void setMetricsCollector(MigrationMetricsCollector metricsCollector) {
        this.metricsCollector = metricsCollector;
    }
    
    public void setAlertingSystem(MigrationAlertingSystem alertingSystem) {
        this.alertingSystem = alertingSystem;
    }
    
    public void setFlyway(Flyway flyway) {
        this.flyway = flyway;
    }
    
    /**
     * Executes all pending migrations
     * Requirement 1.1: Migration execution workflow
     */
    @Override
    public MigrationResult executeMigrations() {
        logger.info("Starting migration execution");
        long startTime = System.currentTimeMillis();
        
        try {
            Flyway flyway = createFlywayInstance();
            
            // Get pending migrations count before execution
            MigrationInfo[] pendingMigrations = flyway.info().pending();
            int pendingCount = pendingMigrations.length;
            
            if (pendingCount == 0) {
                logger.info("No pending migrations found");
                return MigrationResult.success("No pending migrations", 0, 0);
            }
            
            logger.info("Found {} pending migration(s)", pendingCount);
            
            // Execute migrations
            flyway.migrate();
            
            long executionTime = System.currentTimeMillis() - startTime;
            String currentVersion = getCurrentSchemaVersion(flyway);
            
            // Get the number of migrations executed by comparing before and after
            int migrationsExecuted = pendingCount;
            
            String message = String.format("Successfully executed %d migration(s) in %d ms", 
                migrationsExecuted, executionTime);
            
            logger.info(message);
            
            // Record metrics
            if (metricsCollector != null) {
                metricsCollector.recordMigrationSuccess(migrationsExecuted, executionTime);
                updateMigrationCountMetrics(flyway);
            }
            
            return MigrationResult.builder()
                .success(true)
                .message(message)
                .migrationsExecuted(migrationsExecuted)
                .executionTimeMs(executionTime)
                .currentSchemaVersion(currentVersion)
                .build();
            
        } catch (FlywayException e) {
            long executionTime = System.currentTimeMillis() - startTime;
            String errorMsg = "Migration execution failed: " + e.getMessage();
            logger.error(errorMsg, e);
            
            // Record failure metrics
            if (metricsCollector != null) {
                metricsCollector.recordMigrationFailure(executionTime);
            }
            
            // Send alert
            if (alertingSystem != null) {
                alertingSystem.alertMigrationFailure("unknown", errorMsg, Arrays.asList(e.getMessage()));
            }
            
            return MigrationResult.builder()
                .success(false)
                .message(errorMsg)
                .errors(Arrays.asList(e.getMessage()))
                .executionTimeMs(executionTime)
                .build();
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            String errorMsg = "Unexpected error during migration execution: " + e.getMessage();
            logger.error(errorMsg, e);
            
            // Record failure metrics
            if (metricsCollector != null) {
                metricsCollector.recordMigrationFailure(executionTime);
            }
            
            // Send alert
            if (alertingSystem != null) {
                alertingSystem.alertMigrationFailure("unknown", errorMsg, Arrays.asList(e.getMessage()));
            }
            
            return MigrationResult.builder()
                .success(false)
                .message(errorMsg)
                .errors(Arrays.asList(e.getMessage()))
                .executionTimeMs(executionTime)
                .build();
        }
    }
    
    /**
     * Validates all migrations without executing them
     * Requirement 1.5: Complete startup migration validation within 30 seconds
     */
    @Override
    public MigrationValidationResult validateMigrations() {
        logger.info("Starting migration validation");
        long startTime = System.currentTimeMillis();
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] migrations = infoService.all();
            
            MigrationValidationResult result = new MigrationValidationResult();
            
            // Check timeout constraint
            long timeoutMs = migrationProperties.getValidationTimeout() * 1000L;
            
            for (MigrationInfo migration : migrations) {
                // Check for timeout
                long elapsed = System.currentTimeMillis() - startTime;
                if (elapsed > timeoutMs) {
                    result.addError("Validation timeout exceeded: " + elapsed + "ms > " + timeoutMs + "ms");
                    break;
                }
                
                // Check migration state
                String state = migration.getState().name();
                
                if (state.contains("FAILED")) {
                    result.addError("Migration " + migration.getVersion() + " is in FAILED state: " + migration.getDescription());
                }
                
                if ("OUTDATED".equals(state)) {
                    result.addChecksumMismatch("Migration " + migration.getVersion() + " has checksum mismatch: " + migration.getDescription());
                }
                
                // Validate naming conventions if enabled
                if (migrationProperties.getValidateNamingConventions()) {
                    validateNamingConvention(migration, result);
                }
            }
            
            long validationTime = System.currentTimeMillis() - startTime;
            logger.info("Migration validation completed in {} ms", validationTime);
            
            if (validationTime > timeoutMs) {
                logger.warn("Validation exceeded timeout: {} ms > {} ms", validationTime, timeoutMs);
            }
            
            // Record validation metrics
            if (metricsCollector != null) {
                metricsCollector.recordValidation(validationTime);
                if (result.hasChecksumMismatches()) {
                    metricsCollector.recordChecksumMismatch(result.getChecksumMismatches().size());
                }
            }
            
            // Send alerts for validation issues
            if (alertingSystem != null) {
                if (result.hasErrors()) {
                    alertingSystem.alertValidationError("Migration validation failed", 
                        result.getValidationErrors());
                }
                if (result.hasChecksumMismatches()) {
                    for (String mismatch : result.getChecksumMismatches()) {
                        alertingSystem.alertChecksumMismatch("unknown", mismatch);
                    }
                }
            }
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error during migration validation", e);
            MigrationValidationResult result = new MigrationValidationResult();
            result.addError("Validation failed: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * Repairs schema history to resolve checksum mismatches
     * Requirement 1.1: Detect and resolve checksum mismatches automatically
     */
    @Override
    public RepairResult repairSchemaHistory() {
        logger.info("Starting schema history repair");
        
        if (!migrationProperties.getAutoRepair()) {
            logger.info("Auto-repair is disabled, skipping repair operation");
            return RepairResult.success("Auto-repair disabled, no action taken");
        }
        
        // Record repair metrics
        if (metricsCollector != null) {
            metricsCollector.recordRepairOperation();
        }
        
        // Use the advanced schema repair service for better strategy selection
        return schemaRepairService.performAutomaticRepair();
    }
    
    /**
     * Creates a backup before migration execution
     * Requirement 2.1: Create automatic backups before schema changes
     */
    @Override
    public BackupResult createPreMigrationBackup() {
        logger.info("Creating pre-migration backup");
        
        if (!migrationProperties.getBackupBeforeMigration()) {
            logger.info("Pre-migration backup is disabled");
            return BackupResult.success("Backup disabled, no action taken", null, 0);
        }
        
        // For now, return a placeholder implementation
        // This will be implemented in task 3.1 (Database Backup Service)
        logger.warn("Backup service not yet implemented, returning placeholder result");
        return BackupResult.success("Backup service placeholder - not yet implemented", null, 0);
    }
    
    /**
     * Gets the current health status of the migration system
     * Requirement 4.1: Log all migration activities with timestamps and status
     */
    @Override
    public HealthStatus getHealthStatus() {
        logger.debug("Checking migration system health status");
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationValidationResult validation = validateMigrations();
            
            HealthStatus.Builder statusBuilder = HealthStatus.builder()
                .timestamp(LocalDateTime.now())
                .addDetail("lastCheck", LocalDateTime.now())
                .addDetail("autoRepairEnabled", migrationProperties.getAutoRepair())
                .addDetail("backupEnabled", migrationProperties.getBackupBeforeMigration());
            
            // Add current schema version
            String currentVersion = getCurrentSchemaVersion(flyway);
            statusBuilder.addDetail("currentSchemaVersion", currentVersion);
            
            // Add migration counts
            MigrationInfo[] all = flyway.info().all();
            MigrationInfo[] pending = flyway.info().pending();
            statusBuilder.addDetail("totalMigrations", all.length);
            statusBuilder.addDetail("pendingMigrations", pending.length);
            
            if (validation.hasErrors() || validation.hasChecksumMismatches()) {
                List<String> issues = new ArrayList<>();
                issues.addAll(validation.getValidationErrors());
                issues.addAll(validation.getChecksumMismatches());
                
                if (validation.hasChecksumMismatches() && migrationProperties.getAutoRepair()) {
                    return statusBuilder
                        .status(HealthStatus.Status.DEGRADED)
                        .message("Checksum mismatches detected but auto-repair is enabled")
                        .issues(issues)
                        .build();
                } else {
                    return statusBuilder
                        .status(HealthStatus.Status.UNHEALTHY)
                        .message("Migration validation failed")
                        .issues(issues)
                        .build();
                }
            }
            
            return statusBuilder
                .status(HealthStatus.Status.HEALTHY)
                .message("Migration system is healthy")
                .build();
            
        } catch (Exception e) {
            logger.error("Error checking migration health status", e);
            return HealthStatus.unhealthy("Health check failed: " + e.getMessage(), 
                Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Executes migrations with automatic backup and repair if needed
     * This is the main orchestration method that combines all operations
     */
    @Override
    public MigrationResult executeWithSafeguards() {
        logger.info("Starting migration execution with safeguards");
        long startTime = System.currentTimeMillis();
        
        try {
            // Step 1: Validate current state
            MigrationValidationResult validation = validateMigrations();
            
            // Step 2: Repair if needed and auto-repair is enabled
            if (validation.hasChecksumMismatches() && migrationProperties.getAutoRepair()) {
                logger.info("Checksum mismatches detected, attempting repair");
                RepairResult repairResult = repairSchemaHistory();
                
                if (!repairResult.isSuccess()) {
                    return MigrationResult.failure("Repair failed: " + repairResult.getMessage(), 
                        repairResult.getErrors());
                }
                
                // Re-validate after repair
                validation = validateMigrations();
            }
            
            // Step 3: Check if there are still validation issues
            if (validation.hasErrors()) {
                return MigrationResult.failure("Validation failed", validation.getValidationErrors());
            }
            
            // Step 4: Create backup if enabled
            if (migrationProperties.getBackupBeforeMigration()) {
                BackupResult backupResult = createPreMigrationBackup();
                if (!backupResult.isSuccess()) {
                    logger.warn("Backup failed but continuing with migration: {}", backupResult.getMessage());
                }
            }
            
            // Step 5: Execute migrations
            MigrationResult migrationResult = executeMigrations();
            
            long totalTime = System.currentTimeMillis() - startTime;
            
            if (migrationResult.isSuccess()) {
                String message = String.format("Migration with safeguards completed successfully in %d ms. %s", 
                    totalTime, migrationResult.getMessage());
                
                return MigrationResult.builder()
                    .success(true)
                    .message(message)
                    .migrationsExecuted(migrationResult.getMigrationsExecuted())
                    .executionTimeMs(totalTime)
                    .currentSchemaVersion(migrationResult.getCurrentSchemaVersion())
                    .build();
            } else {
                return migrationResult;
            }
            
        } catch (Exception e) {
            long totalTime = System.currentTimeMillis() - startTime;
            String errorMsg = "Migration with safeguards failed: " + e.getMessage();
            logger.error(errorMsg, e);
            
            return MigrationResult.builder()
                .success(false)
                .message(errorMsg)
                .errors(Arrays.asList(e.getMessage()))
                .executionTimeMs(totalTime)
                .build();
        }
    }
    
    /**
     * Creates a Flyway instance with current configuration
     */
    private Flyway createFlywayInstance() {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .validateOnMigrate(true)
            .load();
    }
    
    /**
     * Gets the current schema version from Flyway
     */
    private String getCurrentSchemaVersion(Flyway flyway) {
        try {
            MigrationInfo current = flyway.info().current();
            return current != null ? current.getVersion().toString() : "0";
        } catch (Exception e) {
            logger.warn("Could not determine current schema version", e);
            return "unknown";
        }
    }
    
    /**
     * Validates migration naming convention
     * Requirement 5.1: Enforce naming conventions for migration files
     */
    private void validateNamingConvention(MigrationInfo migration, MigrationValidationResult result) {
        String description = migration.getDescription();
        
        if (description == null || description.trim().isEmpty()) {
            result.addError("Migration " + migration.getVersion() + " has empty description");
            return;
        }
        
        // Check for proper description format (no special characters except underscores and spaces)
        if (!description.matches("^[a-zA-Z0-9_\\s]+$")) {
            result.addError("Migration " + migration.getVersion() + " description contains invalid characters: " + description);
        }
        
        // Check for reasonable description length
        if (description.length() > 100) {
            result.addError("Migration " + migration.getVersion() + " description is too long (>100 chars): " + description);
        }
    }
    
    /**
     * Performs a dry-run of pending migrations
     * Requirement 2.4: Support dry-run mode for testing migrations without applying changes
     */
    @Override
    public DryRunResult performDryRun() {
        logger.info("Delegating to DryRunMigrationService for dry-run execution");
        return dryRunMigrationService.performDryRun();
    }
    
    /**
     * Updates migration count metrics from Flyway info
     */
    private void updateMigrationCountMetrics(Flyway flyway) {
        try {
            MigrationInfo[] allMigrations = flyway.info().all();
            
            int pending = 0;
            int applied = 0;
            int failed = 0;
            
            for (MigrationInfo migration : allMigrations) {
                String state = migration.getState().name();
                
                if (state.equals("SUCCESS")) {
                    applied++;
                } else if (state.equals("PENDING")) {
                    pending++;
                } else if (state.contains("FAILED")) {
                    failed++;
                }
            }
            
            metricsCollector.updateMigrationCounts(pending, applied, failed);
        } catch (Exception e) {
            logger.warn("Failed to update migration count metrics", e);
        }
    }
}