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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Advanced schema repair service with multiple repair strategies
 * Provides automatic checksum repair functionality and manual repair options
 * 
 * Requirements addressed:
 * - 1.2: Repair the Flyway schema history table to match current migration files
 * - 1.3: Provide manual repair options for administrators
 * - 3.4: Create repair strategy selection logic
 */
public class SchemaRepairService {
    
    private static final Logger logger = LoggerFactory.getLogger(SchemaRepairService.class);
    
    public enum RepairStrategy {
        AUTOMATIC_REPAIR,      // Standard Flyway repair
        SELECTIVE_REPAIR,      // Repair specific migrations
        BASELINE_RESET,        // Create new baseline
        CHECKSUM_UPDATE,       // Update checksums only
        MANUAL_OVERRIDE        // Manual administrator intervention
    }
    
    private DataSource dataSource;
    private Flyway flyway;
    
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void setFlyway(Flyway flyway) {
        this.flyway = flyway;
    }
    
    @Autowired
    private MigrationProperties migrationProperties;
    
    @Autowired
    private ChecksumValidator checksumValidator;
    
    @Autowired
    private MigrationRepairService legacyRepairService;
    
    /**
     * Performs automatic checksum repair using the best strategy
     * Requirement 1.2: Implement automatic checksum repair functionality
     * 
     * @return RepairResult containing repair operation details
     */
    public RepairResult performAutomaticRepair() {
        logger.info("Starting automatic schema repair");
        
        if (!migrationProperties.getAutoRepair()) {
            logger.info("Auto-repair is disabled");
            return RepairResult.success("Auto-repair disabled, no action taken");
        }
        
        try {
            // First, analyze the current state to determine the best strategy
            RepairStrategy strategy = determineOptimalRepairStrategy();
            logger.info("Selected repair strategy: {}", strategy);
            
            return executeRepairStrategy(strategy);
            
        } catch (Exception e) {
            String errorMsg = "Automatic repair failed: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Performs repair using a specific strategy
     * Requirement 1.3: Add manual repair options for administrators
     * 
     * @param strategy Repair strategy to use
     * @return RepairResult containing repair operation details
     */
    public RepairResult performRepairWithStrategy(RepairStrategy strategy) {
        logger.info("Starting schema repair with strategy: {}", strategy);
        
        try {
            return executeRepairStrategy(strategy);
        } catch (Exception e) {
            String errorMsg = "Repair with strategy " + strategy + " failed: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Repairs specific migrations by version
     * Requirement 1.3: Add manual repair options for administrators
     * 
     * @param migrationVersions List of migration versions to repair
     * @return RepairResult containing repair operation details
     */
    public RepairResult performSelectiveRepair(List<String> migrationVersions) {
        logger.info("Starting selective repair for migrations: {}", migrationVersions);
        
        try {
            // Validate that the specified migrations exist and have issues
            ChecksumValidationResult validation = checksumValidator.validateAllChecksums();
            List<String> mismatchedMigrations = validation.getMismatchedMigrations();
            
            List<String> validTargets = new ArrayList<>();
            List<String> invalidTargets = new ArrayList<>();
            
            for (String version : migrationVersions) {
                if (mismatchedMigrations.contains(version)) {
                    validTargets.add(version);
                } else {
                    invalidTargets.add(version);
                }
            }
            
            if (!invalidTargets.isEmpty()) {
                logger.warn("Some specified migrations do not have checksum issues: {}", invalidTargets);
            }
            
            if (validTargets.isEmpty()) {
                return RepairResult.success("No migrations with checksum issues found in the specified list");
            }
            
            // For selective repair, we use the standard Flyway repair
            // which will fix all checksum issues, not just the selected ones
            logger.info("Performing Flyway repair for {} migrations with issues", validTargets.size());
            
            Flyway flyway = createFlywayInstance();
            flyway.repair();
            
            // Validate the repair was successful
            ChecksumValidationResult postRepairValidation = checksumValidator.validateAllChecksums();
            
            if (postRepairValidation.hasMismatches()) {
                return RepairResult.failure("Selective repair failed - some mismatches remain", 
                    postRepairValidation.getErrors());
            }
            
            String successMsg = String.format("Selective repair completed successfully for %d migrations", 
                validTargets.size());
            logger.info(successMsg);
            
            return RepairResult.success(successMsg);
            
        } catch (Exception e) {
            String errorMsg = "Selective repair failed: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Creates a new baseline from the current schema state
     * Useful when migrations have diverged significantly
     * 
     * @param baselineVersion Version to use for the new baseline
     * @param baselineDescription Description for the baseline
     * @return RepairResult containing baseline operation details
     */
    public RepairResult performBaselineReset(String baselineVersion, String baselineDescription) {
        logger.info("Starting baseline reset with version: {}", baselineVersion);
        
        try {
            Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineVersion(baselineVersion)
                .baselineDescription(baselineDescription)
                .load();
            
            // Clean and baseline
            flyway.clean();
            flyway.baseline();
            
            logger.info("Baseline reset completed with version: {}", baselineVersion);
            
            return RepairResult.success("Baseline reset completed successfully with version " + baselineVersion);
            
        } catch (FlywayException e) {
            String errorMsg = "Baseline reset failed: " + e.getMessage();
            logger.error(errorMsg, e);
            return RepairResult.failure(errorMsg, Arrays.asList(e.getMessage()));
        }
    }
    
    /**
     * Determines the optimal repair strategy based on current state
     * Requirement 3.4: Create repair strategy selection logic
     * 
     * @return Recommended repair strategy
     */
    public RepairStrategy determineOptimalRepairStrategy() {
        logger.debug("Analyzing current state to determine optimal repair strategy");
        
        try {
            ChecksumValidationResult validation = checksumValidator.validateAllChecksums();
            
            int totalMigrations = validation.getTotalChecked();
            int mismatchCount = validation.getMismatchCount();
            
            if (mismatchCount == 0) {
                logger.debug("No checksum mismatches found, no repair needed");
                return RepairStrategy.AUTOMATIC_REPAIR; // Will be a no-op
            }
            
            // If more than 50% of migrations have issues, consider baseline reset
            if (totalMigrations > 0 && (double) mismatchCount / totalMigrations > 0.5) {
                logger.debug("High percentage of mismatches ({}%), recommending baseline reset", 
                    (mismatchCount * 100 / totalMigrations));
                return RepairStrategy.BASELINE_RESET;
            }
            
            // If only a few migrations have issues, use selective repair
            if (mismatchCount <= 3) {
                logger.debug("Few mismatches found ({}), recommending selective repair", mismatchCount);
                return RepairStrategy.SELECTIVE_REPAIR;
            }
            
            // Default to automatic repair for moderate number of issues
            logger.debug("Moderate number of mismatches ({}), using automatic repair", mismatchCount);
            return RepairStrategy.AUTOMATIC_REPAIR;
            
        } catch (Exception e) {
            logger.warn("Error analyzing repair strategy, defaulting to automatic repair", e);
            return RepairStrategy.AUTOMATIC_REPAIR;
        }
    }
    
    /**
     * Executes the specified repair strategy
     * 
     * @param strategy Strategy to execute
     * @return RepairResult containing operation details
     */
    private RepairResult executeRepairStrategy(RepairStrategy strategy) {
        switch (strategy) {
            case AUTOMATIC_REPAIR:
                return executeAutomaticRepair();
                
            case SELECTIVE_REPAIR:
                return executeSelectiveRepair();
                
            case BASELINE_RESET:
                return executeBaselineReset();
                
            case CHECKSUM_UPDATE:
                return executeChecksumUpdate();
                
            case MANUAL_OVERRIDE:
                return RepairResult.success("Manual override selected - administrator intervention required");
                
            default:
                return RepairResult.failure("Unknown repair strategy: " + strategy);
        }
    }
    
    /**
     * Executes automatic repair using Flyway's built-in repair
     */
    private RepairResult executeAutomaticRepair() {
        logger.info("Executing automatic repair using Flyway repair command");
        
        // Delegate to the existing legacy repair service
        return legacyRepairService.performEmergencyRepair();
    }
    
    /**
     * Executes selective repair for migrations with checksum issues
     */
    private RepairResult executeSelectiveRepair() {
        logger.info("Executing selective repair");
        
        try {
            ChecksumValidationResult validation = checksumValidator.validateAllChecksums();
            List<String> mismatchedMigrations = validation.getMismatchedMigrations();
            
            if (mismatchedMigrations.isEmpty()) {
                return RepairResult.success("No migrations require selective repair");
            }
            
            return performSelectiveRepair(mismatchedMigrations);
            
        } catch (Exception e) {
            return RepairResult.failure("Selective repair execution failed: " + e.getMessage());
        }
    }
    
    /**
     * Executes baseline reset with current schema version
     */
    private RepairResult executeBaselineReset() {
        logger.info("Executing baseline reset");
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationInfo current = flyway.info().current();
            
            String baselineVersion = current != null ? current.getVersion().toString() : "1.0";
            String baselineDescription = "Baseline reset at " + java.time.LocalDateTime.now();
            
            return performBaselineReset(baselineVersion, baselineDescription);
            
        } catch (Exception e) {
            return RepairResult.failure("Baseline reset execution failed: " + e.getMessage());
        }
    }
    
    /**
     * Executes checksum update without full repair
     */
    private RepairResult executeChecksumUpdate() {
        logger.info("Executing checksum update");
        
        try {
            // This is essentially the same as automatic repair for Flyway
            return executeAutomaticRepair();
            
        } catch (Exception e) {
            return RepairResult.failure("Checksum update execution failed: " + e.getMessage());
        }
    }
    
    /**
     * Gets repair recommendations based on current state
     * 
     * @return RepairRecommendation containing analysis and suggestions
     */
    public RepairRecommendation getRepairRecommendations() {
        logger.info("Generating repair recommendations");
        
        try {
            ChecksumValidationResult validation = checksumValidator.validateAllChecksums();
            RepairStrategy recommendedStrategy = determineOptimalRepairStrategy();
            
            RepairRecommendation recommendation = new RepairRecommendation();
            recommendation.setValidationResult(validation);
            recommendation.setRecommendedStrategy(recommendedStrategy);
            recommendation.setAnalysisTimestamp(java.time.LocalDateTime.now());
            
            // Add detailed analysis
            List<String> recommendations = new ArrayList<>();
            
            if (validation.getMismatchCount() == 0) {
                recommendations.add("No repair needed - all checksums are valid");
            } else {
                recommendations.add(String.format("Found %d checksum mismatches out of %d migrations", 
                    validation.getMismatchCount(), validation.getTotalChecked()));
                recommendations.add("Recommended strategy: " + recommendedStrategy);
                
                switch (recommendedStrategy) {
                    case AUTOMATIC_REPAIR:
                        recommendations.add("Use automatic repair for standard checksum fixes");
                        break;
                    case SELECTIVE_REPAIR:
                        recommendations.add("Use selective repair for targeted fixes");
                        break;
                    case BASELINE_RESET:
                        recommendations.add("Consider baseline reset due to extensive issues");
                        break;
                }
            }
            
            recommendation.setRecommendations(recommendations);
            
            return recommendation;
            
        } catch (Exception e) {
            logger.error("Error generating repair recommendations", e);
            
            RepairRecommendation errorRecommendation = new RepairRecommendation();
            errorRecommendation.setRecommendations(Arrays.asList(
                "Error analyzing repair needs: " + e.getMessage(),
                "Consider manual inspection of migration state"
            ));
            
            return errorRecommendation;
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
}