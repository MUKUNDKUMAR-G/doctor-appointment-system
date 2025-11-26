package com.healthcare.appointmentsystem.migration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MigrationRepairService
 * Tests the core functionality of migration repair operations
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class MigrationRepairServiceTest {
    
    @Mock
    private DataSource dataSource;
    
    @InjectMocks
    private MigrationRepairService migrationRepairService;
    
    @Test
    void testRepairResultSuccess() {
        // Test RepairResult success creation
        RepairResult result = RepairResult.success("Test success message");
        
        assertTrue(result.isSuccess());
        assertEquals("Test success message", result.getMessage());
        assertFalse(result.hasErrors());
        assertNotNull(result.getTimestamp());
    }
    
    @Test
    void testRepairResultFailure() {
        // Test RepairResult failure creation
        RepairResult result = RepairResult.failure("Test failure message");
        
        assertFalse(result.isSuccess());
        assertEquals("Test failure message", result.getMessage());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        assertEquals("Test failure message", result.getErrors().get(0));
    }
    
    @Test
    void testMigrationValidationResult() {
        // Test MigrationValidationResult functionality
        MigrationValidationResult result = new MigrationValidationResult();
        
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
        assertFalse(result.hasChecksumMismatches());
        
        result.addError("Test error");
        result.addChecksumMismatch("Test checksum mismatch");
        
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.hasChecksumMismatches());
        assertEquals(1, result.getChecksumMismatchCount());
        assertEquals(2, result.getErrors().size());
    }
    
    @Test
    void testRepairResultToString() {
        // Test RepairResult toString method
        RepairResult successResult = RepairResult.success("Success");
        RepairResult failureResult = RepairResult.failure("Failure");
        
        assertNotNull(successResult.toString());
        assertNotNull(failureResult.toString());
        assertTrue(successResult.toString().contains("success=true"));
        assertTrue(failureResult.toString().contains("success=false"));
    }
}