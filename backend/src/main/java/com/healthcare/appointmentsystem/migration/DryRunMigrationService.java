package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for performing dry-run migrations
 * Validates migrations without actually executing them
 * 
 * Requirements addressed:
 * - 2.4: Support dry-run mode for testing migrations without applying changes
 * - 5.4: Implement impact analysis reporting
 */
@Service
public class DryRunMigrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(DryRunMigrationService.class);
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private MigrationProperties migrationProperties;
    
    @Autowired
    private MigrationValidator migrationValidator;
    
    /**
     * Performs a dry-run of pending migrations
     * Validates without executing
     * 
     * @return DryRunResult containing validation results and impact analysis
     */
    public DryRunResult performDryRun() {
        logger.info("Starting dry-run migration validation");
        long startTime = System.currentTimeMillis();
        
        DryRunResult result = new DryRunResult();
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationInfoService infoService = flyway.info();
            
            // Get pending migrations
            MigrationInfo[] pendingMigrations = infoService.pending();
            result.setPendingMigrationsCount(pendingMigrations.length);
            
            if (pendingMigrations.length == 0) {
                result.setSuccess(true);
                result.setMessage("No pending migrations to validate");
                logger.info("Dry-run completed: No pending migrations");
                return result;
            }
            
            logger.info("Found {} pending migration(s) for dry-run validation", pendingMigrations.length);
            
            // Validate each pending migration
            List<MigrationPreview> previews = new ArrayList<>();
            boolean hasErrors = false;
            
            for (MigrationInfo migration : pendingMigrations) {
                MigrationPreview preview = createMigrationPreview(migration);
                previews.add(preview);
                
                if (preview.hasValidationErrors()) {
                    hasErrors = true;
                }
            }
            
            result.setMigrationPreviews(previews);
            
            // Perform dependency validation across all migrations
            MigrationValidator.DependencyValidationResult depResult = 
                    migrationValidator.validateDependencies(List.of(pendingMigrations));
            
            if (depResult.hasErrors()) {
                result.addErrors(depResult.getErrors());
                hasErrors = true;
            }
            
            if (depResult.hasWarnings()) {
                result.addWarnings(depResult.getWarnings());
            }
            
            // Generate impact analysis
            ImpactAnalysis impactAnalysis = generateImpactAnalysis(pendingMigrations);
            result.setImpactAnalysis(impactAnalysis);
            
            long executionTime = System.currentTimeMillis() - startTime;
            result.setExecutionTimeMs(executionTime);
            
            if (hasErrors) {
                result.setSuccess(false);
                result.setMessage("Dry-run validation failed with errors");
                logger.warn("Dry-run completed with errors in {}ms", executionTime);
            } else {
                result.setSuccess(true);
                result.setMessage("Dry-run validation successful - migrations are ready to execute");
                logger.info("Dry-run completed successfully in {}ms", executionTime);
            }
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            result.setSuccess(false);
            result.setMessage("Dry-run failed: " + e.getMessage());
            result.addError("Exception during dry-run: " + e.getMessage());
            result.setExecutionTimeMs(executionTime);
            logger.error("Dry-run failed after {}ms: {}", executionTime, e.getMessage(), e);
        }
        
        return result;
    }
    
    /**
     * Creates a preview for a single migration
     */
    private MigrationPreview createMigrationPreview(MigrationInfo migration) {
        MigrationPreview preview = new MigrationPreview();
        preview.setVersion(migration.getVersion() != null ? migration.getVersion().toString() : "unknown");
        preview.setDescription(migration.getDescription());
        preview.setType(migration.getType().name());
        preview.setState(migration.getState().name());
        
        // Get script content
        try {
            String script = migration.getScript();
            preview.setScriptPreview(getScriptPreview(script));
            preview.setScriptLength(script != null ? script.length() : 0);
        } catch (Exception e) {
            logger.warn("Could not get script for migration V{}: {}", 
                    migration.getVersion(), e.getMessage());
        }
        
        // Validate the migration
        MigrationValidator.ValidationResult validationResult = 
                migrationValidator.validateMigration(migration);
        
        preview.setValidationErrors(validationResult.getErrors());
        preview.setValidationWarnings(validationResult.getWarnings());
        
        return preview;
    }
    
    /**
     * Generates impact analysis for pending migrations
     * Requirement 5.4: Implement impact analysis reporting
     */
    private ImpactAnalysis generateImpactAnalysis(MigrationInfo[] migrations) {
        ImpactAnalysis analysis = new ImpactAnalysis();
        
        for (MigrationInfo migration : migrations) {
            try {
                String script = migration.getScript();
                if (script == null) {
                    continue;
                }
                
                String upperScript = script.toUpperCase();
                
                // Count operations
                if (upperScript.contains("CREATE TABLE")) {
                    analysis.incrementTablesCreated();
                }
                
                if (upperScript.contains("ALTER TABLE")) {
                    analysis.incrementTablesModified();
                }
                
                if (upperScript.contains("DROP TABLE")) {
                    analysis.incrementTablesDropped();
                }
                
                if (upperScript.contains("CREATE INDEX")) {
                    analysis.incrementIndexesCreated();
                }
                
                if (upperScript.contains("INSERT INTO")) {
                    analysis.incrementDataInsertions();
                }
                
                if (upperScript.contains("UPDATE ")) {
                    analysis.incrementDataUpdates();
                }
                
                if (upperScript.contains("DELETE FROM")) {
                    analysis.incrementDataDeletions();
                }
                
                // Estimate execution time based on operations
                int estimatedSeconds = estimateExecutionTime(script);
                analysis.addEstimatedExecutionTime(estimatedSeconds);
                
                // Check for potentially risky operations
                if (upperScript.contains("DROP TABLE") || upperScript.contains("TRUNCATE")) {
                    analysis.addRiskyOperation("Migration V" + migration.getVersion() + 
                            " contains destructive operations (DROP/TRUNCATE)");
                }
                
                if (upperScript.contains("ALTER TABLE") && upperScript.contains("DROP COLUMN")) {
                    analysis.addRiskyOperation("Migration V" + migration.getVersion() + 
                            " drops columns which may cause data loss");
                }
                
            } catch (Exception e) {
                logger.warn("Could not analyze migration V{}: {}", 
                        migration.getVersion(), e.getMessage());
            }
        }
        
        return analysis;
    }
    
    /**
     * Estimates execution time for a migration script
     */
    private int estimateExecutionTime(String script) {
        // Simple heuristic: 1 second per 100 lines + 1 second per CREATE TABLE + 2 seconds per large INSERT
        int lines = script.split("\n").length;
        int createTables = countOccurrences(script.toUpperCase(), "CREATE TABLE");
        int inserts = countOccurrences(script.toUpperCase(), "INSERT INTO");
        
        return (lines / 100) + createTables + (inserts * 2);
    }
    
    /**
     * Counts occurrences of a substring
     */
    private int countOccurrences(String text, String substring) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }
    
    /**
     * Gets a preview of the script (first 500 characters)
     */
    private String getScriptPreview(String script) {
        if (script == null) {
            return "";
        }
        
        if (script.length() <= 500) {
            return script;
        }
        
        return script.substring(0, 500) + "... (truncated)";
    }
    
    /**
     * Creates a Flyway instance for validation
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
