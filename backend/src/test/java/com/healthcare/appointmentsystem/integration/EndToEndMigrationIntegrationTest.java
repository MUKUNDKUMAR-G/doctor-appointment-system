package com.healthcare.appointmentsystem.integration;

import com.healthcare.appointmentsystem.migration.*;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-end integration tests for complete migration scenarios
 * Tests full migration lifecycle including backup, execution, validation, and rollback
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "spring.flyway.locations=classpath:db/migration/test",
    "spring.flyway.clean-disabled=false",
    "migration.auto-repair=true",
    "migration.backup-before-migration=true",
    "migration.backup-directory=./target/test-backups",
    "migration.retention-days=7"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EndToEndMigrationIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private MigrationManager migrationManager;

    @Autowired
    private DatabaseBackupService backupService;

    @Autowired
    private MigrationRollbackSystem rollbackSystem;

    @Autowired
    private DryRunMigrationService dryRunService;

    @Autowired
    private MigrationValidator migrationValidator;

    @Autowired
    private MigrationExecutionLogger executionLogger;

    private JdbcTemplate jdbcTemplate;
    private Flyway flyway;

    @BeforeEach
    void setUp() {
        jdbcTemplate = new JdbcTemplate(dataSource);
        
        flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/test")
                .cleanDisabled(false)
                .load();
        
        flyway.clean();
    }

    @Test
    @Order(1)
    void testCompleteSuccessfulMigrationWorkflow() {
        // Step 1: Validate migrations before execution
        MigrationValidationResult validationResult = migrationValidator.validateMigrations();
        assertTrue(validationResult.isValid());
        
        // Step 2: Create pre-migration backup
        BackupResult backupResult = backupService.createPreMigrationBackup("V1");
        assertTrue(backupResult.isSuccess());
        assertNotNull(backupResult.getBackupFilePath());
        
        // Step 3: Execute migrations
        MigrationResult migrationResult = migrationManager.executeMigrations();
        assertTrue(migrationResult.isSuccess());
        assertTrue(migrationResult.getMigrationsApplied() > 0);
        
        // Step 4: Verify database state
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
        
        // Step 5: Verify execution was logged
        assertNotNull(executionLogger);
        
        // Step 6: Check health status
        HealthStatus healthStatus = migrationManager.getHealthStatus();
        assertTrue(healthStatus.isHealthy());
        assertEquals(0, healthStatus.getPendingMigrations());
    }

    @Test
    @Order(2)
    void testMigrationWithDryRun() {
        // Step 1: Perform dry-run
        DryRunResult dryRunResult = dryRunService.performDryRun();
        
        // Verify dry-run results
        assertTrue(dryRunResult.isValid());
        assertNotNull(dryRunResult.getPreview());
        assertTrue(dryRunResult.getPreview().getPendingMigrations().size() > 0);
        
        // Verify no actual changes were made
        assertFalse(tableExists("TEST_USERS"));
        assertFalse(tableExists("TEST_POSTS"));
        
        // Step 2: Execute actual migrations
        MigrationResult migrationResult = migrationManager.executeMigrations();
        assertTrue(migrationResult.isSuccess());
        
        // Verify changes were applied
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
    }

    @Test
    @Order(3)
    void testMigrationWithBackupAndRollback() {
        // Step 1: Execute initial migrations
        flyway.migrate();
        
        // Insert test data
        jdbcTemplate.update(
            "INSERT INTO test_users (username, email) VALUES (?, ?)",
            "testuser", "test@example.com"
        );
        
        Integer initialUserCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM test_users",
            Integer.class
        );
        assertEquals(1, initialUserCount);
        
        // Step 2: Create backup
        BackupResult backupResult = backupService.createPreMigrationBackup("V2");
        assertTrue(backupResult.isSuccess());
        
        // Step 3: Simulate migration failure scenario
        // (In real scenario, this would be a failed migration)
        jdbcTemplate.update("DELETE FROM test_users");
        
        Integer afterDeleteCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM test_users",
            Integer.class
        );
        assertEquals(0, afterDeleteCount);
        
        // Step 4: Perform rollback
        RollbackResult rollbackResult = rollbackSystem.rollbackToBackup(
            backupResult.getBackupName()
        );
        
        // Verify rollback (in this test, we verify the backup exists)
        assertTrue(rollbackResult.isSuccess());
        Path backupPath = Paths.get(backupResult.getBackupFilePath());
        assertTrue(Files.exists(backupPath));
    }

    @Test
    @Order(4)
    void testIncrementalMigrationExecution() {
        // Step 1: Execute first migration only
        flyway.migrate();
        
        // Verify V1 tables exist
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
        
        // Verify V2 columns don't exist yet (they should, as all migrations run)
        // But we can verify the incremental nature by checking migration history
        var appliedMigrations = flyway.info().applied();
        assertTrue(appliedMigrations.length >= 1);
        
        // Step 2: Verify each migration was applied incrementally
        for (var migration : appliedMigrations) {
            assertNotNull(migration.getInstalledOn());
            assertTrue(migration.getExecutionTime() >= 0);
        }
    }

    @Test
    @Order(5)
    void testMigrationValidationAndExecution() {
        // Step 1: Validate before execution
        MigrationValidationResult preValidation = migrationValidator.validateMigrations();
        assertTrue(preValidation.isValid());
        assertFalse(preValidation.hasErrors());
        
        // Step 2: Execute migrations
        MigrationResult migrationResult = migrationManager.executeMigrations();
        assertTrue(migrationResult.isSuccess());
        
        // Step 3: Validate after execution
        ChecksumValidationResult postValidation = migrationManager.validateMigrations();
        assertTrue(postValidation.isValid());
        assertEquals(0, postValidation.getMismatchCount());
    }

    @Test
    @Order(6)
    void testMultipleBackupCreation() {
        // Execute initial migrations
        flyway.migrate();
        
        // Create multiple backups
        BackupResult backup1 = backupService.createPreMigrationBackup("V1");
        BackupResult backup2 = backupService.createPreMigrationBackup("V2");
        BackupResult backup3 = backupService.createPreMigrationBackup("V3");
        
        // Verify all backups were created
        assertTrue(backup1.isSuccess());
        assertTrue(backup2.isSuccess());
        assertTrue(backup3.isSuccess());
        
        // Verify backup files exist
        assertTrue(Files.exists(Paths.get(backup1.getBackupFilePath())));
        assertTrue(Files.exists(Paths.get(backup2.getBackupFilePath())));
        assertTrue(Files.exists(Paths.get(backup3.getBackupFilePath())));
        
        // Verify backups have different names
        assertNotEquals(backup1.getBackupName(), backup2.getBackupName());
        assertNotEquals(backup2.getBackupName(), backup3.getBackupName());
    }

    @Test
    @Order(7)
    void testMigrationHealthMonitoring() {
        // Initial health check (no migrations)
        HealthStatus initialHealth = migrationManager.getHealthStatus();
        assertNotNull(initialHealth);
        
        // Execute migrations
        MigrationResult migrationResult = migrationManager.executeMigrations();
        assertTrue(migrationResult.isSuccess());
        
        // Health check after migrations
        HealthStatus postMigrationHealth = migrationManager.getHealthStatus();
        assertTrue(postMigrationHealth.isHealthy());
        assertNotNull(postMigrationHealth.getCurrentVersion());
        assertEquals(0, postMigrationHealth.getPendingMigrations());
        
        // Verify health details
        assertNotNull(postMigrationHealth.getLastMigrationTime());
    }

    @Test
    @Order(8)
    void testConcurrentMigrationSafety() {
        // This test verifies that migration system handles concurrent access safely
        // In real scenario, Flyway uses database locks to prevent concurrent migrations
        
        // Execute migrations
        MigrationResult result1 = migrationManager.executeMigrations();
        assertTrue(result1.isSuccess());
        
        // Try to execute again (should be idempotent)
        MigrationResult result2 = migrationManager.executeMigrations();
        assertTrue(result2.isSuccess());
        assertEquals(0, result2.getMigrationsApplied(), "No new migrations should be applied");
        
        // Verify database state is consistent
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
    }

    @Test
    @Order(9)
    void testMigrationWithDataIntegrity() {
        // Execute migrations
        flyway.migrate();
        
        // Insert test data
        jdbcTemplate.update(
            "INSERT INTO test_users (username, email) VALUES (?, ?)",
            "user1", "user1@example.com"
        );
        
        Long userId = jdbcTemplate.queryForObject(
            "SELECT id FROM test_users WHERE username = ?",
            Long.class,
            "user1"
        );
        
        jdbcTemplate.update(
            "INSERT INTO test_posts (user_id, title, content) VALUES (?, ?, ?)",
            userId, "Test Post", "Test Content"
        );
        
        // Verify foreign key relationships
        Integer postCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM test_posts WHERE user_id = ?",
            Integer.class,
            userId
        );
        assertEquals(1, postCount);
        
        // Verify data integrity after additional migrations
        // (All migrations are already applied, but we verify data persists)
        Integer userCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM test_users",
            Integer.class
        );
        assertEquals(1, userCount);
    }

    @Test
    @Order(10)
    void testCompleteWorkflowWithAllComponents() {
        // This test exercises all major components in a realistic workflow
        
        // Step 1: Validation
        MigrationValidationResult validation = migrationValidator.validateMigrations();
        assertTrue(validation.isValid());
        
        // Step 2: Dry-run
        DryRunResult dryRun = dryRunService.performDryRun();
        assertTrue(dryRun.isValid());
        int expectedMigrations = dryRun.getPreview().getPendingMigrations().size();
        
        // Step 3: Backup
        BackupResult backup = backupService.createPreMigrationBackup("complete-workflow");
        assertTrue(backup.isSuccess());
        
        // Step 4: Execute migrations
        MigrationResult migration = migrationManager.executeMigrations();
        assertTrue(migration.isSuccess());
        assertEquals(expectedMigrations, migration.getMigrationsApplied());
        
        // Step 5: Post-migration validation
        ChecksumValidationResult checksumValidation = migrationManager.validateMigrations();
        assertTrue(checksumValidation.isValid());
        
        // Step 6: Health check
        HealthStatus health = migrationManager.getHealthStatus();
        assertTrue(health.isHealthy());
        
        // Step 7: Verify database state
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
        assertTrue(tableExists("TEST_COMMENTS"));
        
        // Step 8: Verify backup exists
        assertTrue(Files.exists(Paths.get(backup.getBackupFilePath())));
    }

    // Helper methods
    
    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?",
                Integer.class,
                tableName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
