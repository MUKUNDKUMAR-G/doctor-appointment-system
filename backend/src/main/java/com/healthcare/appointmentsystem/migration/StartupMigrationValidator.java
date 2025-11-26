package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;

/**
 * Startup component that validates migrations and performs automatic repair if needed
 * Addresses requirement 1.1: Detect and resolve checksum mismatches automatically during startup
 * Requirement 1.5: Implement startup migration execution
 */
public class StartupMigrationValidator {
    
    private static final Logger logger = LoggerFactory.getLogger(StartupMigrationValidator.class);
    
    private MigrationRepairService migrationRepairService;
    private MigrationManager migrationManager;
    private Integer validationTimeout = 30;
    
    public void setMigrationRepairService(MigrationRepairService migrationRepairService) {
        this.migrationRepairService = migrationRepairService;
    }
    
    public void setMigrationManager(MigrationManager migrationManager) {
        this.migrationManager = migrationManager;
    }
    
    public void setValidationTimeout(Integer validationTimeout) {
        this.validationTimeout = validationTimeout;
    }
    
    /**
     * Validates migrations on application startup and performs repair if needed
     * Requirement 1.1: THE Migration_Manager SHALL detect and resolve checksum mismatches automatically
     * Requirement 1.5: THE Migration_Manager SHALL complete startup migration validation within configured timeout
     */
    @EventListener(ApplicationReadyEvent.class)
    @Order(1) // Execute early in the startup process
    public void validateMigrationsOnStartup() {
        logger.info("Starting migration validation on application startup (timeout: {}s)", validationTimeout);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // First, validate migrations using the migration manager
            MigrationValidationResult validationResult = migrationManager.validateMigrations();
            
            if (validationResult.isValid()) {
                long duration = System.currentTimeMillis() - startTime;
                logger.info("✅ Migration validation passed in {} ms - Application ready", duration);
                return;
            }
            
            // If validation fails, attempt automatic repair
            logger.warn("Migration validation failed - attempting automatic repair");
            logger.warn("Validation issues: {}", validationResult.getIssues());
            
            RepairResult repairResult = migrationRepairService.performEmergencyRepair();
            
            if (repairResult.isSuccess()) {
                // Validate again after repair
                MigrationValidationResult revalidationResult = migrationManager.validateMigrations();
                
                if (revalidationResult.isValid()) {
                    long duration = System.currentTimeMillis() - startTime;
                    logger.info("✅ Automatic repair successful - Application ready in {} ms", duration);
                } else {
                    logger.error("❌ Application still not ready after repair - manual intervention required");
                    logger.error("Remaining issues: {}", revalidationResult.getIssues());
                    logManualRepairInstructions();
                }
            } else {
                logger.error("❌ Automatic repair failed: {}", repairResult.getMessage());
                if (repairResult.hasErrors()) {
                    repairResult.getErrors().forEach(error -> logger.error("  - {}", error));
                }
                logManualRepairInstructions();
            }
            
        } catch (Exception e) {
            logger.error("❌ Critical error during startup migration validation", e);
            logManualRepairInstructions();
        }
        
        long totalDuration = System.currentTimeMillis() - startTime;
        long timeoutMs = validationTimeout * 1000L;
        if (totalDuration > timeoutMs) {
            logger.warn("⚠️ Migration validation took {} ms (exceeded {} second target)", 
                totalDuration, validationTimeout);
        }
    }
    
    /**
     * Logs manual repair instructions for administrators
     * Requirement 1.3: Provide clear error messages with resolution steps
     */
    private void logManualRepairInstructions() {
        logger.error("");
        logger.error("=== MANUAL REPAIR INSTRUCTIONS ===");
        logger.error("The application detected migration issues that require manual intervention:");
        logger.error("");
        logger.error("Option 1 - Run Emergency Repair Script:");
        logger.error("  java -jar appointment-system.jar --spring.profiles.active=repair");
        logger.error("");
        logger.error("Option 2 - Manual Flyway Repair:");
        logger.error("  mvn flyway:repair -Dflyway.configFiles=flyway.conf");
        logger.error("");
        logger.error("Option 3 - Database Console Repair:");
        logger.error("  1. Connect to your MySQL database");
        logger.error("  2. Check the flyway_schema_history table");
        logger.error("  3. Look for entries with checksum mismatches");
        logger.error("  4. Either update checksums or revert file changes");
        logger.error("");
        logger.error("Option 4 - Reset Migration History (CAUTION - DATA LOSS RISK):");
        logger.error("  1. Backup your database first!");
        logger.error("  2. DROP TABLE flyway_schema_history;");
        logger.error("  3. Restart the application (will recreate schema history)");
        logger.error("");
        logger.error("For assistance, check the migration logs above for specific error details.");
        logger.error("=====================================");
        logger.error("");
    }
}