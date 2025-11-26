package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * Configuration class for migration management components
 * Ensures proper bean creation and profile handling
 * 
 * Requirements addressed:
 * - 1.1: Integrate migration manager with application context
 * - 1.5: Implement startup migration execution
 * - 3.1: Create conditional migration execution based on profiles
 */
@Configuration
@EnableConfigurationProperties(MigrationProperties.class)
public class MigrationConfig {
    
    @Autowired
    private MigrationProperties migrationProperties;
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * Creates Flyway bean with custom configuration
     * Requirement 1.1: Configure Flyway for migration management
     */
    @Bean
    @Profile("!test")
    @ConditionalOnProperty(
        name = "spring.flyway.enabled",
        havingValue = "true",
        matchIfMissing = true
    )
    public Flyway flyway() {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .baselineVersion("0")
            .validateOnMigrate(true)
            .outOfOrder(false)
            .load();
    }
    
    /**
     * Creates MigrationManager bean for normal application profiles
     * Central orchestrator for all migration operations
     * Requirement 1.5: Add migration manager to application context
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "spring.flyway.enabled",
        havingValue = "true",
        matchIfMissing = true
    )
    public MigrationManager migrationManager(Flyway flyway, 
                                            MigrationMetricsCollector metricsCollector,
                                            MigrationAlertingSystem alertingSystem) {
        MigrationManagerImpl manager = new MigrationManagerImpl();
        manager.setFlyway(flyway);
        manager.setMigrationProperties(migrationProperties);
        manager.setMetricsCollector(metricsCollector);
        manager.setAlertingSystem(alertingSystem);
        return manager;
    }
    
    /**
     * Creates MigrationRepairService bean for normal application profiles
     * Excludes the repair profile to avoid conflicts with the emergency script
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "spring.flyway.enabled",
        havingValue = "true",
        matchIfMissing = true
    )
    public MigrationRepairService migrationRepairService(Flyway flyway) {
        MigrationRepairService service = new MigrationRepairService();
        service.setFlyway(flyway);
        return service;
    }
    
    /**
     * Creates ChecksumValidator bean for normal application profiles
     * Component for validating migration file checksums
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "spring.flyway.enabled",
        havingValue = "true",
        matchIfMissing = true
    )
    public ChecksumValidator checksumValidator(Flyway flyway) {
        ChecksumValidator validator = new ChecksumValidator();
        validator.setFlyway(flyway);
        return validator;
    }
    
    /**
     * Creates SchemaRepairService bean for normal application profiles
     * Advanced schema repair service with multiple repair strategies
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "spring.flyway.enabled",
        havingValue = "true",
        matchIfMissing = true
    )
    public SchemaRepairService schemaRepairService(Flyway flyway) {
        SchemaRepairService service = new SchemaRepairService();
        service.setFlyway(flyway);
        return service;
    }
    
    /**
     * Creates DatabaseBackupService bean
     * Requirement 2.1: Create automatic backups before schema changes
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "migration.backup-before-migration",
        havingValue = "true",
        matchIfMissing = true
    )
    public DatabaseBackupService databaseBackupService() {
        DatabaseBackupService service = new DatabaseBackupService();
        service.setBackupDirectory(migrationProperties.getBackupDirectory());
        service.setRetentionDays(migrationProperties.getBackupRetentionDays());
        return service;
    }
    
    /**
     * Creates MigrationValidator bean
     * Requirement 5.1: Enforce naming conventions and best practices
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "migration.validate-naming-conventions",
        havingValue = "true",
        matchIfMissing = true
    )
    public MigrationValidator migrationValidator() {
        MigrationValidator validator = new MigrationValidator();
        validator.setValidateNamingConventions(migrationProperties.getValidateNamingConventions());
        validator.setCheckDependencies(migrationProperties.getCheckDependencies());
        return validator;
    }
    
    /**
     * Creates StartupMigrationValidator bean for normal application profiles
     * This component automatically validates migrations on startup
     * Requirement 1.1: Implement startup migration execution
     * Requirement 1.5: Complete startup migration validation within configured timeout
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "migration.auto-repair", 
        havingValue = "true", 
        matchIfMissing = true
    )
    public StartupMigrationValidator startupMigrationValidator(
            MigrationRepairService migrationRepairService,
            MigrationManager migrationManager) {
        StartupMigrationValidator validator = new StartupMigrationValidator();
        validator.setMigrationRepairService(migrationRepairService);
        validator.setMigrationManager(migrationManager);
        validator.setValidationTimeout(migrationProperties.getValidationTimeout());
        return validator;
    }
    
    /**
     * Creates BackupCleanupScheduler bean
     * Requirement 2.5: Add cleanup automation for expired backups
     */
    @Bean
    @Profile("!repair & !test")
    @ConditionalOnProperty(
        name = "migration.backup-cleanup-enabled",
        havingValue = "true",
        matchIfMissing = false
    )
    public BackupCleanupScheduler backupCleanupScheduler(
            DatabaseBackupService backupService) {
        BackupCleanupScheduler scheduler = new BackupCleanupScheduler();
        scheduler.setBackupService(backupService);
        scheduler.setRetentionDays(migrationProperties.getBackupRetentionDays());
        scheduler.setMaxBackupsToRetain(migrationProperties.getMaxBackupsToRetain());
        return scheduler;
    }
    
    /**
     * Creates MigrationSecurityService bean
     * Requirement 3.5: Audit logging for all migration activities
     * Requirement 4.1: Security features for migration operations
     */
    @Bean
    @Profile("!repair & !test")
    public MigrationSecurityService migrationSecurityService() {
        MigrationSecurityService service = new MigrationSecurityService();
        service.initialize();
        return service;
    }
    
    /**
     * Creates DatabaseAccessControl bean
     * Requirement 4.1: Implement database access controls
     */
    @Bean
    @Profile("!repair & !test")
    public DatabaseAccessControl databaseAccessControl() {
        return new DatabaseAccessControl();
    }
}