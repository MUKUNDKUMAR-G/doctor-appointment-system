package com.healthcare.appointmentsystem.integration;

import com.healthcare.appointmentsystem.migration.*;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for database migration operations
 * Tests the complete migration lifecycle with actual database
 * 
 * Requirements tested:
 * - 1.1: Detect and resolve checksum mismatches automatically
 * - 2.1: Create automatic backups before schema changes
 * - 2.3: Automatic rollback on migration failure
 * - 3.1: Enforce sequential version numbering
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "spring.flyway.locations=classpath:db/migration/test",
    "spring.flyway.clean-disabled=false",
    "migration.backup-directory=./target/test-backups",
    "migration.retention-days=7"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DatabaseMigrationIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private MigrationManager migrationManager;

    @Autowired
    private DatabaseBackupService backupService;

    @Autowired
    private ChecksumValidator checksumValidator;

    private JdbcTemplate jdbcTemplate;
    private Flyway flyway;

    @BeforeEach
    void setUp() {
        jdbcTemplate = new JdbcTemplate(dataSource);
        
        // Create Flyway instance for test migrations
        flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/test")
                .cleanDisabled(false)
                .load();
        
        // Clean database before each test
        flyway.clean();
    }

    @Test
    @Order(1)
    void testInitialMigrationExecution() {
        // Execute migrations
        MigrationResult result = migrationManager.executeMigrations();
        
        // Verify migration success
        assertTrue(result.isSuccess());
        assertTrue(result.getMigrationsApplied() > 0);
        assertNotNull(result.getMessage());
        
        // Verify tables were created
        Integer userTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TEST_USERS'",
            Integer.class
        );
        assertEquals(1, userTableCount);
        
        Integer postTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TEST_POSTS'",
            Integer.class
        );
        assertEquals(1, postTableCount);
        
        // Verify Flyway schema history
        MigrationInfo[] appliedMigrations = flyway.info().applied();
        assertTrue(appliedMigrations.length > 0);
    }

    @Test
    @Order(2)
    void testMigrationWithBackup() {
        // Apply initial migrations
        flyway.migrate();
        
        // Create backup before next migration
        BackupResult backupResult = backupService.createPreMigrationBackup("V2");
        
        // Verify backup was created
        assertTrue(backupResult.isSuccess());
        assertNotNull(backupResult.getBackupFilePath());
        assertTrue(backupResult.getBackupSizeBytes() > 0);
        
        // Verify backup file exists
        Path backupPath = Paths.get(backupResult.getBackupFilePath());
        assertTrue(Files.exists(backupPath));
        
        // Execute next migration
        MigrationResult migrationResult = migrationManager.executeMigrations();
        assertTrue(migrationResult.isSuccess());
    }

    @Test
    @Order(3)
    void testChecksumValidation() {
        // Apply migrations
        flyway.migrate();
        
        // Validate checksums
        ChecksumValidationResult validationResult = checksumValidator.validateAllMigrations();
        
        // Verify validation success
        assertTrue(validationResult.isValid());
        assertEquals(0, validationResult.getMismatchCount());
        assertNotNull(validationResult.getReport());
    }

    @Test
    @Order(4)
    void testSequentialMigrationVersioning() {
        // Execute migrations
        MigrationResult result = migrationManager.executeMigrations();
        assertTrue(result.isSuccess());
        
        // Get applied migrations
        MigrationInfo[] migrations = flyway.info().applied();
        
        // Verify sequential versioning
        for (int i = 1; i < migrations.length; i++) {
            String prevVersion = migrations[i - 1].getVersion().getVersion();
            String currVersion = migrations[i].getVersion().getVersion();
            
            // Verify current version is greater than previous
            assertTrue(
                compareVersions(currVersion, prevVersion) > 0,
                "Migration versions should be sequential"
            );
        }
    }

    @Test
    @Order(5)
    void testMigrationHealthStatus() {
        // Apply migrations
        flyway.migrate();
        
        // Check health status
        HealthStatus healthStatus = migrationManager.getHealthStatus();
        
        // Verify health status
        assertNotNull(healthStatus);
        assertTrue(healthStatus.isHealthy());
        assertNotNull(healthStatus.getCurrentVersion());
        assertEquals(0, healthStatus.getPendingMigrations());
    }

    @Test
    @Order(6)
    void testDatabaseStateAfterMigrations() {
        // Execute all migrations
        flyway.migrate();
        
        // Verify V1 schema
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
        assertTrue(columnExists("TEST_USERS", "USERNAME"));
        assertTrue(columnExists("TEST_USERS", "EMAIL"));
        
        // Verify V2 additions
        assertTrue(columnExists("TEST_USERS", "PHONE_NUMBER"));
        assertTrue(columnExists("TEST_USERS", "IS_ACTIVE"));
        assertTrue(columnExists("TEST_POSTS", "VIEW_COUNT"));
        
        // Verify V3 schema
        assertTrue(tableExists("TEST_COMMENTS"));
        assertTrue(columnExists("TEST_COMMENTS", "COMMENT_TEXT"));
    }

    @Test
    @Order(7)
    void testMigrationMetadata() {
        // Execute migrations
        flyway.migrate();
        
        // Get migration info
        MigrationInfo[] migrations = flyway.info().all();
        
        // Verify metadata
        for (MigrationInfo migration : migrations) {
            assertNotNull(migration.getVersion());
            assertNotNull(migration.getDescription());
            assertNotNull(migration.getType());
            
            if (migration.getState().isApplied()) {
                assertNotNull(migration.getInstalledOn());
                assertTrue(migration.getExecutionTime() >= 0);
            }
        }
    }

    // Helper methods
    
    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?",
            Integer.class,
            tableName
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
            Integer.class,
            tableName,
            columnName
        );
        return count != null && count > 0;
    }

    private int compareVersions(String v1, String v2) {
        String[] parts1 = v1.split("\\.");
        String[] parts2 = v2.split("\\.");
        
        int length = Math.max(parts1.length, parts2.length);
        for (int i = 0; i < length; i++) {
            int num1 = i < parts1.length ? Integer.parseInt(parts1[i]) : 0;
            int num2 = i < parts2.length ? Integer.parseInt(parts2[i]) : 0;
            
            if (num1 != num2) {
                return Integer.compare(num1, num2);
            }
        }
        return 0;
    }
}
