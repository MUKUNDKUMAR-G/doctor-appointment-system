package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * Emergency repair script for fixing Flyway checksum mismatches
 * Can be run as a standalone application to repair migration issues
 * 
 * Usage: java -jar appointment-system.jar --spring.profiles.active=repair
 */
@SpringBootApplication
@Profile("repair")
public class EmergencyRepairScript {
    
    private static final Logger logger = LoggerFactory.getLogger(EmergencyRepairScript.class);
    
    public static void main(String[] args) {
        // Set repair profile if not already set
        System.setProperty("spring.profiles.active", "repair");
        
        logger.info("Starting Emergency Migration Repair Script");
        logger.info("This script will attempt to fix Flyway checksum mismatches");
        
        SpringApplication app = new SpringApplication(EmergencyRepairScript.class);
        app.setAdditionalProfiles("repair");
        app.run(args);
    }
    
    @Bean
    @Profile("repair")
    public CommandLineRunner repairRunner(DataSource dataSource) {
        return args -> {
            logger.info("=== EMERGENCY FLYWAY REPAIR OPERATION ===");
            
            try {
                // Create repair service instance
                MigrationRepairService repairService = new MigrationRepairService();
                
                // Inject datasource manually since we're in a command line context
                java.lang.reflect.Field dataSourceField = MigrationRepairService.class.getDeclaredField("dataSource");
                dataSourceField.setAccessible(true);
                dataSourceField.set(repairService, dataSource);
                
                // Perform the emergency repair
                RepairResult result = repairService.performEmergencyRepair();
                
                if (result.isSuccess()) {
                    logger.info("✅ REPAIR SUCCESSFUL: {}", result.getMessage());
                    logger.info("The application should now start normally");
                    System.exit(0);
                } else {
                    logger.error("❌ REPAIR FAILED: {}", result.getMessage());
                    if (result.hasErrors()) {
                        logger.error("Errors encountered:");
                        result.getErrors().forEach(error -> logger.error("  - {}", error));
                    }
                    
                    logger.error("Manual intervention may be required");
                    logger.error("Consider the following options:");
                    logger.error("1. Check if migration files have been modified");
                    logger.error("2. Verify database connectivity");
                    logger.error("3. Review Flyway schema history table manually");
                    
                    System.exit(1);
                }
                
            } catch (Exception e) {
                logger.error("❌ CRITICAL ERROR during repair operation", e);
                logger.error("Manual database intervention required");
                System.exit(1);
            }
        };
    }
    
    /**
     * Alternative repair method that can be called directly
     * Useful for integration with build scripts or CI/CD pipelines
     */
    public static RepairResult performDirectRepair(DataSource dataSource) {
        logger.info("Performing direct repair operation");
        
        try {
            Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .validateOnMigrate(false) // Disable validation during repair
                .load();
            
            logger.info("Executing Flyway repair command");
            flyway.repair();
            
            logger.info("Repair command executed successfully");
            return RepairResult.success("Direct repair completed successfully");
            
        } catch (Exception e) {
            logger.error("Direct repair failed", e);
            return RepairResult.failure("Direct repair failed: " + e.getMessage());
        }
    }
}