package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Spring Boot Actuator Health Indicator for migration system
 * Provides health check endpoint for monitoring migration status
 * 
 * Requirements addressed:
 * - 4.1: Log all migration activities with timestamps and status
 * - 4.4: Provide health check endpoints for monitoring systems
 */
@Component
@ConditionalOnBean(MigrationManager.class)
public class MigrationHealthIndicator implements HealthIndicator {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationHealthIndicator.class);
    
    private final MigrationManager migrationManager;
    private final Flyway flyway;
    
    public MigrationHealthIndicator(MigrationManager migrationManager, Flyway flyway) {
        this.migrationManager = migrationManager;
        this.flyway = flyway;
    }
    
    /**
     * Performs health check on migration system
     * Returns UP if system is healthy, DOWN if unhealthy, or OUT_OF_SERVICE if degraded
     */
    @Override
    public Health health() {
        try {
            logger.debug("Performing migration health check");
            
            // Get health status from migration manager
            HealthStatus healthStatus = migrationManager.getHealthStatus();
            
            // Perform schema integrity validation
            SchemaIntegrityResult integrityResult = validateSchemaIntegrity();
            
            // Build health response based on status
            Health.Builder healthBuilder = mapHealthStatus(healthStatus);
            
            // Add basic details
            healthBuilder
                .withDetail("timestamp", LocalDateTime.now())
                .withDetail("status", healthStatus.getStatus())
                .withDetail("message", healthStatus.getMessage());
            
            // Add all details from health status
            healthStatus.getDetails().forEach(healthBuilder::withDetail);
            
            // Add schema integrity details
            healthBuilder
                .withDetail("schemaIntegrity", integrityResult.isValid() ? "VALID" : "INVALID")
                .withDetail("integrityChecks", integrityResult.getChecks());
            
            // Add issues if any
            if (!healthStatus.getIssues().isEmpty()) {
                healthBuilder.withDetail("issues", healthStatus.getIssues());
            }
            
            if (!integrityResult.getIssues().isEmpty()) {
                healthBuilder.withDetail("integrityIssues", integrityResult.getIssues());
            }
            
            // Add migration status reporting
            MigrationStatusReport statusReport = generateMigrationStatusReport();
            healthBuilder
                .withDetail("appliedMigrations", statusReport.getAppliedCount())
                .withDetail("pendingMigrations", statusReport.getPendingCount())
                .withDetail("failedMigrations", statusReport.getFailedCount())
                .withDetail("lastMigration", statusReport.getLastMigrationInfo());
            
            logger.debug("Migration health check completed: {}", healthStatus.getStatus());
            
            return healthBuilder.build();
            
        } catch (Exception e) {
            logger.error("Error during migration health check", e);
            return Health.down()
                .withDetail("error", e.getMessage())
                .withDetail("timestamp", LocalDateTime.now())
                .build();
        }
    }
    
    /**
     * Maps HealthStatus to Spring Boot Health.Builder
     */
    private Health.Builder mapHealthStatus(HealthStatus healthStatus) {
        switch (healthStatus.getStatus()) {
            case HEALTHY:
                return Health.up();
            case DEGRADED:
                return Health.status("DEGRADED");
            case UNHEALTHY:
                return Health.down();
            default:
                return Health.unknown();
        }
    }
    
    /**
     * Validates schema integrity
     * Checks for failed migrations, checksum mismatches, and schema consistency
     */
    private SchemaIntegrityResult validateSchemaIntegrity() {
        SchemaIntegrityResult result = new SchemaIntegrityResult();
        
        try {
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] allMigrations = infoService.all();
            
            // Check for failed migrations
            result.addCheck("failedMigrations", "PASSED");
            for (MigrationInfo migration : allMigrations) {
                if (migration.getState().name().contains("FAILED")) {
                    result.addCheck("failedMigrations", "FAILED");
                    result.addIssue("Migration " + migration.getVersion() + " is in FAILED state");
                    result.setValid(false);
                }
            }
            
            // Check for checksum mismatches
            result.addCheck("checksumValidation", "PASSED");
            for (MigrationInfo migration : allMigrations) {
                if ("OUTDATED".equals(migration.getState().name())) {
                    result.addCheck("checksumValidation", "FAILED");
                    result.addIssue("Migration " + migration.getVersion() + " has checksum mismatch");
                    result.setValid(false);
                }
            }
            
            // Check for missing migrations
            result.addCheck("missingMigrations", "PASSED");
            for (MigrationInfo migration : allMigrations) {
                if ("MISSING_SUCCESS".equals(migration.getState().name()) || 
                    "MISSING_FAILED".equals(migration.getState().name())) {
                    result.addCheck("missingMigrations", "FAILED");
                    result.addIssue("Migration " + migration.getVersion() + " is missing from filesystem");
                    result.setValid(false);
                }
            }
            
            // Check schema history table exists
            result.addCheck("schemaHistoryTable", "PASSED");
            try {
                infoService.current();
            } catch (Exception e) {
                result.addCheck("schemaHistoryTable", "FAILED");
                result.addIssue("Schema history table validation failed: " + e.getMessage());
                result.setValid(false);
            }
            
        } catch (Exception e) {
            logger.error("Error validating schema integrity", e);
            result.setValid(false);
            result.addIssue("Schema integrity validation failed: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Generates migration status report
     */
    private MigrationStatusReport generateMigrationStatusReport() {
        MigrationStatusReport report = new MigrationStatusReport();
        
        try {
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] allMigrations = infoService.all();
            
            int applied = 0;
            int pending = 0;
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
            
            report.setAppliedCount(applied);
            report.setPendingCount(pending);
            report.setFailedCount(failed);
            
            // Get last migration info
            MigrationInfo current = infoService.current();
            if (current != null) {
                String lastMigrationInfo = String.format("V%s - %s (installed on %s)",
                    current.getVersion(),
                    current.getDescription(),
                    current.getInstalledOn() != null ? current.getInstalledOn().toString() : "unknown");
                report.setLastMigrationInfo(lastMigrationInfo);
            } else {
                report.setLastMigrationInfo("No migrations applied");
            }
            
        } catch (Exception e) {
            logger.error("Error generating migration status report", e);
            report.setLastMigrationInfo("Error: " + e.getMessage());
        }
        
        return report;
    }
    
    /**
     * Result object for schema integrity validation
     */
    private static class SchemaIntegrityResult {
        private boolean valid = true;
        private final List<String> issues = new ArrayList<>();
        private final List<String> checks = new ArrayList<>();
        
        public boolean isValid() {
            return valid;
        }
        
        public void setValid(boolean valid) {
            this.valid = valid;
        }
        
        public List<String> getIssues() {
            return issues;
        }
        
        public void addIssue(String issue) {
            this.issues.add(issue);
        }
        
        public List<String> getChecks() {
            return checks;
        }
        
        public void addCheck(String checkName, String result) {
            this.checks.add(checkName + ": " + result);
        }
    }
    
    /**
     * Report object for migration status
     */
    private static class MigrationStatusReport {
        private int appliedCount;
        private int pendingCount;
        private int failedCount;
        private String lastMigrationInfo;
        
        public int getAppliedCount() {
            return appliedCount;
        }
        
        public void setAppliedCount(int appliedCount) {
            this.appliedCount = appliedCount;
        }
        
        public int getPendingCount() {
            return pendingCount;
        }
        
        public void setPendingCount(int pendingCount) {
            this.pendingCount = pendingCount;
        }
        
        public int getFailedCount() {
            return failedCount;
        }
        
        public void setFailedCount(int failedCount) {
            this.failedCount = failedCount;
        }
        
        public String getLastMigrationInfo() {
            return lastMigrationInfo;
        }
        
        public void setLastMigrationInfo(String lastMigrationInfo) {
            this.lastMigrationInfo = lastMigrationInfo;
        }
    }
}
