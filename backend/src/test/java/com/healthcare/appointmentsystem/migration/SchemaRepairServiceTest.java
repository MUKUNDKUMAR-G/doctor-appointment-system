package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SchemaRepairService
 * Tests repair strategy selection and execution
 */
@ExtendWith(MockitoExtension.class)
class SchemaRepairServiceTest {
    
    @Mock
    private DataSource dataSource;
    
    @Mock
    private Flyway flyway;
    
    @Mock
    private MigrationProperties migrationProperties;
    
    @Mock
    private ChecksumValidator checksumValidator;
    
    @Mock
    private MigrationRepairService legacyRepairService;
    
    @Mock
    private MigrationInfoService infoService;
    
    @Mock
    private MigrationInfo migrationInfo;
    
    private SchemaRepairService schemaRepairService;
    
    @BeforeEach
    void setUp() {
        schemaRepairService = new SchemaRepairService();
        schemaRepairService.setDataSource(dataSource);
        schemaRepairService.setFlyway(flyway);
        schemaRepairService.migrationProperties = migrationProperties;
        schemaRepairService.checksumValidator = checksumValidator;
        schemaRepairService.legacyRepairService = legacyRepairService;
        
        // Default property values
        when(migrationProperties.getAutoRepair()).thenReturn(true);
    }
    
    @Test
    void testPerformAutomaticRepair_AutoRepairDisabled() {
        // Arrange
        when(migrationProperties.getAutoRepair()).thenReturn(false);
        
        // Act
        RepairResult result = schemaRepairService.performAutomaticRepair();
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Auto-repair disabled"));
        verify(checksumValidator, never()).validateAllChecksums();
    }
    
    @Test
    void testPerformAutomaticRepair_Success() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        validation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test", 123, 456, false));
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        RepairResult expectedResult = RepairResult.success("Repair successful");
        when(legacyRepairService.performEmergencyRepair()).thenReturn(expectedResult);
        
        // Act
        RepairResult result = schemaRepairService.performAutomaticRepair();
        
        // Assert
        assertTrue(result.isSuccess());
    }
    
    @Test
    void testDetermineOptimalRepairStrategy_NoMismatches() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        SchemaRepairService.RepairStrategy strategy = schemaRepairService.determineOptimalRepairStrategy();
        
        // Assert
        assertEquals(SchemaRepairService.RepairStrategy.AUTOMATIC_REPAIR, strategy);
    }
    
    @Test
    void testDetermineOptimalRepairStrategy_FewMismatches() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        validation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test1", 123, 456, false));
        validation.addMismatch("2.0", new ChecksumComparisonResult("2.0", "Test2", 789, 012, false));
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        SchemaRepairService.RepairStrategy strategy = schemaRepairService.determineOptimalRepairStrategy();
        
        // Assert
        assertEquals(SchemaRepairService.RepairStrategy.SELECTIVE_REPAIR, strategy);
    }
    
    @Test
    void testDetermineOptimalRepairStrategy_ManyMismatches() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        // Add 5 mismatches out of 8 total (>50%)
        for (int i = 1; i <= 5; i++) {
            validation.addMismatch(String.valueOf(i), 
                new ChecksumComparisonResult(String.valueOf(i), "Test" + i, 123, 456, false));
        }
        // Add 3 valid migrations
        for (int i = 6; i <= 8; i++) {
            validation.addComparison(String.valueOf(i), 
                new ChecksumComparisonResult(String.valueOf(i), "Test" + i, 123, 123, true));
        }
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        SchemaRepairService.RepairStrategy strategy = schemaRepairService.determineOptimalRepairStrategy();
        
        // Assert
        assertEquals(SchemaRepairService.RepairStrategy.BASELINE_RESET, strategy);
    }
    
    @Test
    void testDetermineOptimalRepairStrategy_ModerateMismatches() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        // Add 4 mismatches (not few, not many)
        for (int i = 1; i <= 4; i++) {
            validation.addMismatch(String.valueOf(i), 
                new ChecksumComparisonResult(String.valueOf(i), "Test" + i, 123, 456, false));
        }
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        SchemaRepairService.RepairStrategy strategy = schemaRepairService.determineOptimalRepairStrategy();
        
        // Assert
        assertEquals(SchemaRepairService.RepairStrategy.AUTOMATIC_REPAIR, strategy);
    }
    
    @Test
    void testPerformRepairWithStrategy_AutomaticRepair() {
        // Arrange
        RepairResult expectedResult = RepairResult.success("Repair successful");
        when(legacyRepairService.performEmergencyRepair()).thenReturn(expectedResult);
        
        // Act
        RepairResult result = schemaRepairService.performRepairWithStrategy(
            SchemaRepairService.RepairStrategy.AUTOMATIC_REPAIR
        );
        
        // Assert
        assertTrue(result.isSuccess());
        verify(legacyRepairService).performEmergencyRepair();
    }
    
    @Test
    void testPerformRepairWithStrategy_ManualOverride() {
        // Act
        RepairResult result = schemaRepairService.performRepairWithStrategy(
            SchemaRepairService.RepairStrategy.MANUAL_OVERRIDE
        );
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Manual override"));
    }
    
    @Test
    void testPerformSelectiveRepair_NoMismatches() {
        // Arrange
        List<String> migrationVersions = Arrays.asList("1.0", "2.0");
        ChecksumValidationResult validation = new ChecksumValidationResult();
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        RepairResult result = schemaRepairService.performSelectiveRepair(migrationVersions);
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("No migrations with checksum issues"));
    }
    
    @Test
    void testPerformSelectiveRepair_WithMismatches() {
        // Arrange
        List<String> migrationVersions = Arrays.asList("1.0", "2.0");
        
        ChecksumValidationResult validation = new ChecksumValidationResult();
        validation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test1", 123, 456, false));
        validation.addMismatch("2.0", new ChecksumComparisonResult("2.0", "Test2", 789, 012, false));
        when(checksumValidator.validateAllChecksums())
            .thenReturn(validation)
            .thenReturn(new ChecksumValidationResult()); // Post-repair validation
        
        when(flyway.info()).thenReturn(infoService);
        
        // Act
        RepairResult result = schemaRepairService.performSelectiveRepair(migrationVersions);
        
        // Assert
        assertTrue(result.isSuccess());
        verify(flyway).repair();
    }
    
    @Test
    void testPerformSelectiveRepair_RepairFails() {
        // Arrange
        List<String> migrationVersions = Arrays.asList("1.0");
        
        ChecksumValidationResult validation = new ChecksumValidationResult();
        validation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test1", 123, 456, false));
        
        ChecksumValidationResult postRepairValidation = new ChecksumValidationResult();
        postRepairValidation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test1", 123, 456, false));
        
        when(checksumValidator.validateAllChecksums())
            .thenReturn(validation)
            .thenReturn(postRepairValidation);
        
        when(flyway.info()).thenReturn(infoService);
        
        // Act
        RepairResult result = schemaRepairService.performSelectiveRepair(migrationVersions);
        
        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("some mismatches remain"));
    }
    
    @Test
    void testPerformBaselineReset_Success() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        
        // Act
        RepairResult result = schemaRepairService.performBaselineReset("1.0", "Test baseline");
        
        // Assert
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Baseline reset completed"));
    }
    
    @Test
    void testGetRepairRecommendations_NoIssues() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        RepairRecommendation recommendation = schemaRepairService.getRepairRecommendations();
        
        // Assert
        assertNotNull(recommendation);
        assertNotNull(recommendation.getValidationResult());
        assertNotNull(recommendation.getRecommendations());
        assertTrue(recommendation.getRecommendations().stream()
            .anyMatch(r -> r.contains("No repair needed")));
    }
    
    @Test
    void testGetRepairRecommendations_WithIssues() {
        // Arrange
        ChecksumValidationResult validation = new ChecksumValidationResult();
        validation.addMismatch("1.0", new ChecksumComparisonResult("1.0", "Test", 123, 456, false));
        when(checksumValidator.validateAllChecksums()).thenReturn(validation);
        
        // Act
        RepairRecommendation recommendation = schemaRepairService.getRepairRecommendations();
        
        // Assert
        assertNotNull(recommendation);
        assertNotNull(recommendation.getRecommendedStrategy());
        assertFalse(recommendation.getRecommendations().isEmpty());
        assertTrue(recommendation.getRecommendations().stream()
            .anyMatch(r -> r.contains("checksum mismatches")));
    }
    
    @Test
    void testGetRepairRecommendations_Error() {
        // Arrange
        when(checksumValidator.validateAllChecksums())
            .thenThrow(new RuntimeException("Validation error"));
        
        // Act
        RepairRecommendation recommendation = schemaRepairService.getRepairRecommendations();
        
        // Assert
        assertNotNull(recommendation);
        assertNotNull(recommendation.getRecommendations());
        assertTrue(recommendation.getRecommendations().stream()
            .anyMatch(r -> r.contains("Error analyzing")));
    }
    
    @Test
    void testRepairStrategy_Values() {
        // Test that all enum values are accessible
        SchemaRepairService.RepairStrategy[] strategies = SchemaRepairService.RepairStrategy.values();
        
        assertEquals(5, strategies.length);
        assertTrue(Arrays.asList(strategies).contains(SchemaRepairService.RepairStrategy.AUTOMATIC_REPAIR));
        assertTrue(Arrays.asList(strategies).contains(SchemaRepairService.RepairStrategy.SELECTIVE_REPAIR));
        assertTrue(Arrays.asList(strategies).contains(SchemaRepairService.RepairStrategy.BASELINE_RESET));
        assertTrue(Arrays.asList(strategies).contains(SchemaRepairService.RepairStrategy.CHECKSUM_UPDATE));
        assertTrue(Arrays.asList(strategies).contains(SchemaRepairService.RepairStrategy.MANUAL_OVERRIDE));
    }
}
