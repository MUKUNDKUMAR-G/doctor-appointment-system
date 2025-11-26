package com.healthcare.appointmentsystem.integration;

import com.healthcare.appointmentsystem.migration.*;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for Flyway-specific migration operations
 * Tests Flyway integration, schema history, and repair operations
 * 
 * Requirements tested:
 * - 1.2: Repair Flyway schema history table
 * - 1.4: Verify all existing migrations against database records
 * - 3.4: Automated resolution options for migration conflicts
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "spring.flyway.locations=classpath:db/migration/test",
    "spring.flyway.clean-disabled=false",
    "migration.auto-repair=true"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FlywayMigrationIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private SchemaRepairService schemaRepairService;

    @Autowired
    private ChecksumValidator checksumValidator;

    @Autowired
    private MigrationRepairService migrationRepairService;

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
    void testFlywaySchemaHistoryCreation() {
        // Execute migrations
        flyway.migrate();
        
        // Verify schema history table exists
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'flyway_schema_history'",
            Integer.class
        );
        assertEquals(1, count);
        
        // Verify schema history has records
        Integer recordCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history",
            Integer.class
        );
        assertTrue(recordCount > 0);
    }

    @Test
    @Order(2)
    void testFlywayMigrationInfo() {
        // Execute migrations
        flyway.migrate();
        
        // Get migration info
        MigrationInfo[] allMigrations = flyway.info().all();
        MigrationInfo[] appliedMigrations = flyway.info().applied();
        MigrationInfo[] pendingMigrations = flyway.info().pending();
        
        // Verify migration info
        assertTrue(allMigrations.length > 0);
        assertTrue(appliedMigrations.length > 0);
        assertEquals(0, pendingMigrations.length);
        
        // Verify each applied migration
        for (MigrationInfo migration : appliedMigrations) {
            assertEquals(MigrationState.SUCCESS, migration.getState());
            assertNotNull(migration.getChecksum());
            assertNotNull(migration.getInstalledOn());
        }
    }

    @Test
    @Order(3)
    void testFlywayRepairOperation() {
        // Execute migrations
        flyway.migrate();
        
        // Simulate checksum mismatch by updating schema history
        jdbcTemplate.update(
            "UPDATE flyway_schema_history SET checksum = -999999 WHERE version = '1'"
        );
        
        // Verify mismatch is detected
        ChecksumValidationResult validationResult = checksumValidator.validateAllMigrations();
        assertFalse(validationResult.isValid());
        assertTrue(validationResult.getMismatchCount() > 0);
        
        // Perform repair
        RepairResult repairResult = schemaRepairService.repairSchemaHistory();
        
        // Verify repair success
        assertTrue(repairResult.isSuccess());
        assertTrue(repairResult.getRepairedCount() > 0);
        
        // Verify checksums are now valid
        ChecksumValidationResult postRepairValidation = checksumValidator.validateAllMigrations();
        assertTrue(postRepairValidation.isValid());
    }

    @Test
    @Order(4)
    void testFlywayBaselineOperation() throws SQLException {
        // Create some tables manually (simulating existing database)
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE TABLE existing_table (id INT PRIMARY KEY, name VARCHAR(100))");
        }
        
        // Create baseline
        flyway.baseline();
        
        // Verify baseline was created
        MigrationInfo[] allMigrations = flyway.info().all();
        assertTrue(allMigrations.length > 0);
        
        MigrationInfo baseline = allMigrations[0];
        assertEquals("1", baseline.getVersion().getVersion());
        assertEquals(MigrationState.BASELINE, baseline.getState());
    }

    @Test
    @Order(5)
    void testFlywayValidateOperation() {
        // Execute migrations
        flyway.migrate();
        
        // Validate should pass
        assertDoesNotThrow(() -> flyway.validate());
        
        // Corrupt checksum
        jdbcTemplate.update(
            "UPDATE flyway_schema_history SET checksum = -888888 WHERE version = '1'"
        );
        
        // Validate should fail
        assertThrows(Exception.class, () -> flyway.validate());
        
        // Repair and validate again
        flyway.repair();
        assertDoesNotThrow(() -> flyway.validate());
    }

    @Test
    @Order(6)
    void testSchemaHistoryMetadata() {
        // Execute migrations
        flyway.migrate();
        
        // Query schema history
        jdbcTemplate.query(
            "SELECT installed_rank, version, description, type, script, checksum, " +
            "installed_by, installed_on, execution_time, success " +
            "FROM flyway_schema_history ORDER BY installed_rank",
            (rs) -> {
                assertTrue(rs.next());
                
                // Verify metadata fields
                assertTrue(rs.getInt("installed_rank") > 0);
                assertNotNull(rs.getString("version"));
                assertNotNull(rs.getString("description"));
                assertEquals("SQL", rs.getString("type"));
                assertNotNull(rs.getString("script"));
                assertNotNull(rs.getInt("checksum"));
                assertNotNull(rs.getString("installed_by"));
                assertNotNull(rs.getTimestamp("installed_on"));
                assertTrue(rs.getInt("execution_time") >= 0);
                assertTrue(rs.getBoolean("success"));
            }
        );
    }

    @Test
    @Order(7)
    void testMigrationChecksumConsistency() {
        // Execute migrations
        flyway.migrate();
        
        // Get checksums from Flyway
        MigrationInfo[] migrations = flyway.info().applied();
        
        // Validate each checksum
        for (MigrationInfo migration : migrations) {
            Integer checksum = migration.getChecksum();
            assertNotNull(checksum);
            
            // Verify checksum in database matches
            Integer dbChecksum = jdbcTemplate.queryForObject(
                "SELECT checksum FROM flyway_schema_history WHERE version = ?",
                Integer.class,
                migration.getVersion().getVersion()
            );
            assertEquals(checksum, dbChecksum);
        }
    }

    @Test
    @Order(8)
    void testRepairServiceIntegration() {
        // Execute migrations
        flyway.migrate();
        
        // Get initial state
        MigrationInfo[] initialMigrations = flyway.info().applied();
        int initialCount = initialMigrations.length;
        
        // Corrupt multiple checksums
        jdbcTemplate.update("UPDATE flyway_schema_history SET checksum = checksum - 1");
        
        // Use repair service
        RepairResult repairResult = migrationRepairService.repairMigrations();
        
        // Verify repair
        assertTrue(repairResult.isSuccess());
        assertEquals(initialCount, repairResult.getRepairedCount());
        
        // Verify all checksums are restored
        MigrationInfo[] repairedMigrations = flyway.info().applied();
        assertEquals(initialCount, repairedMigrations.length);
        
        for (int i = 0; i < initialCount; i++) {
            assertEquals(
                initialMigrations[i].getChecksum(),
                repairedMigrations[i].getChecksum(),
                "Checksum should be restored to original value"
            );
        }
    }

    @Test
    @Order(9)
    void testFlywayCleanOperation() {
        // Execute migrations
        flyway.migrate();
        
        // Verify tables exist
        assertTrue(tableExists("TEST_USERS"));
        assertTrue(tableExists("TEST_POSTS"));
        
        // Clean database
        flyway.clean();
        
        // Verify tables are removed
        assertFalse(tableExists("TEST_USERS"));
        assertFalse(tableExists("TEST_POSTS"));
        
        // Verify schema history is removed
        assertFalse(tableExists("flyway_schema_history"));
    }

    @Test
    @Order(10)
    void testMigrationExecutionOrder() {
        // Execute migrations
        flyway.migrate();
        
        // Get applied migrations
        MigrationInfo[] migrations = flyway.info().applied();
        
        // Verify execution order
        int previousRank = 0;
        for (MigrationInfo migration : migrations) {
            int currentRank = migration.getInstalledRank();
            assertTrue(currentRank > previousRank, "Migrations should be executed in order");
            previousRank = currentRank;
        }
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
