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
import java.util.Arrays;

/**
 * Emergency repair service for Flyway migration checksum mismatches
 * Addresses requirement 1.2: Schema repair functionality
 */
public class MigrationRepairService {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationRepairService.class);
    
    private DataSource dataSource;
    private Flyway flyway;
    
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void setFlyway(Flyway flyway) {
        this.flyway = flyway;
    }
    
    /**
     * Performs emergency repair of Flyway schema history to fix checksum mismatches
     * Requirement 1.1: Detect and resolve checksum mismatches automatically
     * Requirement 1.2: Repair the Flyway schema history table
     * 
     * @return RepairResult containing the outcome of the repair operation
     */
    public RepairResult performEmergencyRepair() {
        logger.info("Starting emergency Flyway repair operation");
        
        try {
            // Create Flyway instance with current configuration
            Flyway flyway = createFlywayInstance();
            
            // Validate current migration state before repair
            MigrationValidationResult preRepairValidation = validateMigrationState(flyway);
            logger.info("Pre-repair validation: {}", preRepairValidation);
            
            if (!preRepairValidation.hasChecksumMismatches()) {
                logger.info("No checksum mismatches detected, repair not needed");
                return RepairResult.success("No repair needed - schema is valid");
            }
            
            // Perform the repair operation
            logger.warn("Checksum mismatches detected, performing repair operation");
            flyway.repair();
            logger.info("Flyway repair operation completed");
            
            // Validate that repair was successful
            MigrationValidationResult postRepairValidation = validateMigrationState(flyway);
            logger.info("Post-repair validation: {}", postRepairValidation);
            
            if (postRepairValidation.hasChecksumMismatches()) {
                String errorMsg = "Repair operation failed - checksum mismatches still exist";
                logger.error(errorMsg);
                return RepairResult.failure(errorMsg, postRepairValidation.getErrors());
            }
            
            String successMsg = String.format("Emergency repair completed successfully. Repaired %d migration(s)", 
                preRepairValidation.getChecksumMismatchCount());
            logger.info(successMsg);
            
            return RepairResult.success(successMsg);
            
        } catch (FlywayException e) {
            String errorMsg = "Flyway repair operation failed: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        } catch (Exception e) {
            String errorMsg = "Unexpected error during repair operation: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Validates the current migration state and identifies checksum mismatches
     * Requirement 1.4: Verify all existing migrations against database records
     * 
     * @param flyway Flyway instance to use for validation
     * @return MigrationValidationResult containing validation details
     */
    private MigrationValidationResult validateMigrationState(Flyway flyway) {
        try {
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] migrations = infoService.all();
            
            MigrationValidationResult result = new MigrationValidationResult();
            
            for (MigrationInfo migration : migrations) {
                if (migration.getState().name().contains("FAILED")) {
                    result.addError("Migration " + migration.getVersion() + " is in FAILED state: " + migration.getDescription());
                }
                
                // Check for checksum mismatches (indicated by OUTDATED state in Flyway)
                if ("OUTDATED".equals(migration.getState().name())) {
                    result.addChecksumMismatch("Migration " + migration.getVersion() + " has checksum mismatch: " + migration.getDescription());
                }
            }
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error validating migration state", e);
            MigrationValidationResult result = new MigrationValidationResult();
            result.addError("Validation failed: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * Creates a Flyway instance with the current application configuration
     * 
     * @return Configured Flyway instance
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
     * Checks if the application can start successfully after repair
     * Requirement 1.5: Complete startup migration validation within 30 seconds
     * 
     * @return true if startup validation passes, false otherwise
     */
    public boolean validateStartupReadiness() {
        logger.info("Validating application startup readiness");
        
        long startTime = System.currentTimeMillis();
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationValidationResult validation = validateMigrationState(flyway);
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Startup validation completed in {} ms", duration);
            
            if (duration > 30000) { // 30 seconds timeout
                logger.warn("Startup validation took longer than 30 seconds: {} ms", duration);
            }
            
            return !validation.hasErrors() && !validation.hasChecksumMismatches();
            
        } catch (Exception e) {
            logger.error("Startup validation failed", e);
            return false;
        }
    }
}