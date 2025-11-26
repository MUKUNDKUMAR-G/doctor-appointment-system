package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.flywaydb.core.api.MigrationState;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MigrationManagerImpl
 * Tests core migration orchestration functionality
 */
@ExtendWith(MockitoExtension.class)
class MigrationManagerImplTest {
    
    @Mock
    private DataSource dataSource;
    
    @Mock
    private MigrationProperties migrationProperties;
    
    @Mock
    private MigrationRepairService repairService;
    
    @Mock
    private SchemaRepairService schemaRepairService;
    
    @Mock
    private DryRunMigrationService dryRunMigrationService;
    
    @Mock
    private MigrationMetricsCollector metricsCollector;
    
    @Mock
    private MigrationAlertingSystem alertingSystem;
    
    @Mock
    private Flyway flyway;
    
    @Mock
    private MigrationInfoService infoService;
    
    @Mock
    private MigrationInfo migrationInfo;
    
    private MigrationManagerImpl migrationManager;
    
    @BeforeEach
    void setUp() {
        migrationManager = new MigrationManagerImpl();
        migrationManager.setDataSource(dataSource);
        migrationManager.setMigrationProperties(migrationProperties);
        migrationManager.setRepairService(repairService);
        migrationManager.setSchemaRepairService(schemaRepairService);
        migrationManager.setDryRunMigrationService(dryRunMigrationService);
        migrationManager.setMetricsCollector(metricsCollector);
        migrationManager.setAlertingSystem(alertingSystem);
        migrationManager.setFlyway(flyway);
        
        // Default property values
        when(migrationProperties.getValidationTimeout()).thenReturn(30);
        when(migrationProperties.getAutoRepair()).thenReturn(true);
        when(migrationProperties.getBackupBeforeMigration()).thenReturn(true);
        when(migrationProperties.getValidateNamingConventions()).thenReturn(false);
    }
    
    @Test
    void testExecuteMigrations_NoPendingMigrations() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        
        // Act
        MigrationResult result = migrationManager.executeMigrations();
        
        // Assert
        assertTrue(result.isSuccess());
        assertEquals(0, result.getMigrationsExecuted());
        assertTrue(result.getMessage().contains("No pending migrations"));
        verify(flyway, never()).migrate();
    }
    
    @Test
    void testExecuteMigrations_Success() {
        // Arrange
        MigrationInfo[] pendingMigrations = new MigrationInfo[]{migrationInfo};
        when(flyway.info()).thenReturn(infoService);
        when(infoService.pending()).thenReturn(pendingMigrations);
        when(infoService.current()).thenReturn(migrationInfo);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        
        org.flywaydb.core.api.MigrationResult flywayResult = 
            mock(org.flywaydb.core.api.MigrationResult.class);
        flywayResult.migrationsExecuted = 1;
        when(flyway.migrate()).thenReturn(flywayResult);
        
        // Act
        MigrationResult result = migrationManager.executeMigrations();
        
        // Assert
        assertTrue(result.isSuccess());
        assertEquals(1, result.getMigrationsExecuted());
        assertNotNull(result.getCurrentSchemaVersion());
        verify(metricsCollector).recordMigrationSuccess(eq(1), anyLong());
    }
    
    @Test
    void testExecuteMigrations_FlywayException() {
        // Arrange
        MigrationInfo[] pendingMigrations = new MigrationInfo[]{migrationInfo};
        when(flyway.info()).thenReturn(infoService);
        when(infoService.pending()).thenReturn(pendingMigrations);
        when(flyway.migrate()).thenThrow(new FlywayException("Migration failed"));
        
        // Act
        MigrationResult result = migrationManager.executeMigrations();
        
        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Migration execution failed"));
        assertTrue(result.hasErrors());
        verify(metricsCollector).recordMigrationFailure(anyLong());
        verify(alertingSystem).alertMigrationFailure(anyString(), anyString(), anyList());
    }
    
    @Test
    void testValidateMigrations_NoIssues() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        
        // Act
        MigrationValidationResult result = migrationManager.validateMigrations();
        
        // Assert
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
        assertFalse(result.hasChecksumMismatches());
        verify(metricsCollector).recordValidation(anyLong());
    }
    
    @Test
    void testValidateMigrations_WithChecksumMismatch() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.OUTDATED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        // Act
        MigrationValidationResult result = migrationManager.validateMigrations();
        
        // Assert
        assertFalse(result.isValid());
        assertTrue(result.hasChecksumMismatches());
        verify(metricsCollector).recordChecksumMismatch(1);
        verify(alertingSystem).alertChecksumMismatch(anyString(), anyString());
    }
    
    @Test
    void testValidateMigrations_Timeout() {
        // Arrange
        when(migrationProperties.getValidationTimeout()).thenReturn(0); // Immediate timeout
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.SUCCESS);
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        // Act
        MigrationValidationResult result = migrationManager.validateMigrations();
        
        // Assert
        assertTrue(result.hasErrors());
        assertTrue(result.getValidationErrors().stream()
            .anyMatch(error -> error.contains("timeout")));
    }
    
    @Test
    void testRepairSchemaHistory_AutoRepairEnabled() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(true);
        RepairResult expectedResult = RepairResult.success("Repair successful");
        when(schemaRepairService.performAutomaticRepair()).thenReturn(expectedResult);
        
        // Act
        RepairResult result = migrationManager.repairSchemaHistory();
        
        // Assert
        assertTrue(result.isSuccess());
        verify(metricsCollector).recordRepairOperation();
        verify(schemaRepairService).performAutomaticRepair();
    }
    
    @Test
    void testRepairSchemaHistory_AutoRepairDisabled() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(false);
        
        // Act
        RepairResult result = migrationManager.repairSchemaHistory();
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Auto-repair disabled"));
        verify(schemaRepairService, never()).performAutomaticRepair();
    }
    
    @Test
    void testCreatePreMigrationBackup_BackupEnabled() {
        // Arrange
        when(migrationProperties.getBackupBeforeMigration()).thenReturn(true);
        
        // Act
        BackupResult result = migrationManager.createPreMigrationBackup();
        
        // Assert
        assertTrue(result.isSuccess());
        assertNotNull(result.getMessage());
    }
    
    @Test
    void testCreatePreMigrationBackup_BackupDisabled() {
        // Arrange
        when(migrationProperties.getBackupBeforeMigration()).thenReturn(false);
        
        // Act
        BackupResult result = migrationManager.createPreMigrationBackup();
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Backup disabled"));
    }
    
    @Test
    void testGetHealthStatus_Healthy() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        when(infoService.current()).thenReturn(migrationInfo);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        
        // Act
        HealthStatus status = migrationManager.getHealthStatus();
        
        // Assert
        assertEquals(HealthStatus.Status.HEALTHY, status.getStatus());
        assertTrue(status.getMessage().contains("healthy"));
        assertNotNull(status.getTimestamp());
    }
    
    @Test
    void testGetHealthStatus_Unhealthy() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.FAILED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Failed migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        
        // Act
        HealthStatus status = migrationManager.getHealthStatus();
        
        // Assert
        assertEquals(HealthStatus.Status.UNHEALTHY, status.getStatus());
        assertTrue(status.hasIssues());
    }
    
    @Test
    void testGetHealthStatus_Degraded() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(true);
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.OUTDATED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Outdated migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        
        // Act
        HealthStatus status = migrationManager.getHealthStatus();
        
        // Assert
        assertEquals(HealthStatus.Status.DEGRADED, status.getStatus());
        assertTrue(status.getMessage().contains("auto-repair"));
    }
    
    @Test
    void testExecuteWithSafeguards_Success() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        
        // Act
        MigrationResult result = migrationManager.executeWithSafeguards();
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("safeguards completed successfully"));
    }
    
    @Test
    void testExecuteWithSafeguards_WithRepair() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(true);
        when(flyway.info()).thenReturn(infoService);
        
        // First validation shows checksum mismatch
        when(migrationInfo.getState())
            .thenReturn(MigrationState.OUTDATED)
            .thenReturn(MigrationState.SUCCESS);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        when(infoService.pending()).thenReturn(new MigrationInfo[0]);
        
        RepairResult repairResult = RepairResult.success("Repair successful");
        when(schemaRepairService.performAutomaticRepair()).thenReturn(repairResult);
        
        // Act
        MigrationResult result = migrationManager.executeWithSafeguards();
        
        // Assert
        assertTrue(result.isSuccess());
        verify(schemaRepairService).performAutomaticRepair();
    }
    
    @Test
    void testExecuteWithSafeguards_RepairFails() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(true);
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.OUTDATED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        RepairResult repairResult = RepairResult.failure("Repair failed");
        when(schemaRepairService.performAutomaticRepair()).thenReturn(repairResult);
        
        // Act
        MigrationResult result = migrationManager.executeWithSafeguards();
        
        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Repair failed"));
    }
    
    @Test
    void testPerformDryRun() {
        // Arrange
        DryRunResult expectedResult = new DryRunResult();
        when(dryRunMigrationService.performDryRun()).thenReturn(expectedResult);
        
        // Act
        DryRunResult result = migrationManager.performDryRun();
        
        // Assert
        assertNotNull(result);
        verify(dryRunMigrationService).performDryRun();
    }
}
