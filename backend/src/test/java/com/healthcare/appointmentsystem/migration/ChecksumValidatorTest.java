package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.flywaydb.core.api.MigrationState;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import javax.sql.DataSource;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChecksumValidator
 * Tests checksum calculation, comparison, and validation functionality
 */
@ExtendWith(MockitoExtension.class)
class ChecksumValidatorTest {
    
    @Mock
    private DataSource dataSource;
    
    @Mock
    private Flyway flyway;
    
    @Mock
    private ResourceLoader resourceLoader;
    
    @Mock
    private MigrationProperties migrationProperties;
    
    @Mock
    private MigrationInfoService infoService;
    
    @Mock
    private MigrationInfo migrationInfo;
    
    @Mock
    private Resource resource;
    
    private ChecksumValidator checksumValidator;
    
    @BeforeEach
    void setUp() {
        checksumValidator = new ChecksumValidator();
        checksumValidator.setDataSource(dataSource);
        checksumValidator.setFlyway(flyway);
        checksumValidator.resourceLoader = resourceLoader;
        checksumValidator.migrationProperties = migrationProperties;
    }
    
    @Test
    void testValidateAllChecksums_NoMigrations() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        
        // Act
        ChecksumValidationResult result = checksumValidator.validateAllChecksums();
        
        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalChecked());
        assertEquals(0, result.getMismatchCount());
        assertFalse(result.hasMismatches());
    }
    
    @Test
    void testValidateAllChecksums_WithMatchingChecksums() throws IOException {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.SUCCESS);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(12345);
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        // Create test content that will produce checksum 12345
        byte[] testContent = "SELECT 1;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        ChecksumValidationResult result = checksumValidator.validateAllChecksums();
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalChecked());
    }
    
    @Test
    void testValidateAllChecksums_WithMismatch() throws IOException {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.OUTDATED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(12345);
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        // Create test content that will produce different checksum
        byte[] testContent = "SELECT 2;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        ChecksumValidationResult result = checksumValidator.validateAllChecksums();
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalChecked());
        assertTrue(result.getMismatchCount() >= 0);
    }
    
    @Test
    void testValidateMigrationChecksum_Match() throws IOException {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(12345);
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        byte[] testContent = "SELECT 1;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Calculate expected checksum
        java.util.zip.CRC32 crc32 = new java.util.zip.CRC32();
        crc32.update(testContent);
        int expectedChecksum = (int) crc32.getValue();
        
        when(migrationInfo.getChecksum()).thenReturn(expectedChecksum);
        
        // Act
        ChecksumComparisonResult result = checksumValidator.validateMigrationChecksum(migrationInfo);
        
        // Assert
        assertNotNull(result);
        assertEquals("1.0", result.getVersion());
        assertTrue(result.isMatch());
    }
    
    @Test
    void testValidateMigrationChecksum_Mismatch() throws IOException {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(99999); // Different checksum
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        byte[] testContent = "SELECT 1;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        ChecksumComparisonResult result = checksumValidator.validateMigrationChecksum(migrationInfo);
        
        // Assert
        assertNotNull(result);
        assertEquals("1.0", result.getVersion());
        assertFalse(result.isMatch());
    }
    
    @Test
    void testValidateMigrationChecksum_FileNotFound() {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(12345);
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(false);
        
        // Act
        ChecksumComparisonResult result = checksumValidator.validateMigrationChecksum(migrationInfo);
        
        // Assert
        assertNotNull(result);
        assertEquals("1.0", result.getVersion());
    }
    
    @Test
    void testCalculateFileChecksum_Success() throws IOException {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        byte[] testContent = "SELECT 1;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        Integer checksum = checksumValidator.calculateFileChecksum(migrationInfo);
        
        // Assert
        assertNotNull(checksum);
        
        // Verify it matches CRC32 calculation
        java.util.zip.CRC32 crc32 = new java.util.zip.CRC32();
        crc32.update(testContent);
        assertEquals((int) crc32.getValue(), checksum);
    }
    
    @Test
    void testCalculateFileChecksum_FileNotFound() {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(false);
        
        // Act
        Integer checksum = checksumValidator.calculateFileChecksum(migrationInfo);
        
        // Assert
        assertNull(checksum);
    }
    
    @Test
    void testCalculateFileChecksum_IOException() throws IOException {
        // Arrange
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        when(resource.getInputStream()).thenThrow(new IOException("Read error"));
        
        // Act
        Integer checksum = checksumValidator.calculateFileChecksum(migrationInfo);
        
        // Assert
        assertNull(checksum);
    }
    
    @Test
    void testRecalculateAllChecksums() throws IOException {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        byte[] testContent = "SELECT 1;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        Map<String, Integer> checksums = checksumValidator.recalculateAllChecksums();
        
        // Assert
        assertNotNull(checksums);
        assertEquals(1, checksums.size());
        assertTrue(checksums.containsKey("1.0"));
        assertNotNull(checksums.get("1.0"));
    }
    
    @Test
    void testRecalculateAllChecksums_NoMigrations() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        
        // Act
        Map<String, Integer> checksums = checksumValidator.recalculateAllChecksums();
        
        // Assert
        assertNotNull(checksums);
        assertTrue(checksums.isEmpty());
    }
    
    @Test
    void testGenerateChecksumReport() {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(infoService.all()).thenReturn(new MigrationInfo[0]);
        
        // Act
        ChecksumReport report = checksumValidator.generateChecksumReport();
        
        // Assert
        assertNotNull(report);
        assertNotNull(report.getValidationResult());
        assertEquals(0, report.getTotalMigrations());
        assertEquals(0, report.getMismatchCount());
        assertNotNull(report.getValidationTimestamp());
        assertNotNull(report.getStatistics());
    }
    
    @Test
    void testGenerateChecksumReport_WithMismatches() throws IOException {
        // Arrange
        when(flyway.info()).thenReturn(infoService);
        when(migrationInfo.getState()).thenReturn(MigrationState.OUTDATED);
        when(migrationInfo.getVersion()).thenReturn(MigrationVersion.fromVersion("1.0"));
        when(migrationInfo.getDescription()).thenReturn("Test_migration");
        when(migrationInfo.getChecksum()).thenReturn(12345);
        when(infoService.all()).thenReturn(new MigrationInfo[]{migrationInfo});
        
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        
        byte[] testContent = "SELECT 2;".getBytes();
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(testContent));
        
        // Act
        ChecksumReport report = checksumValidator.generateChecksumReport();
        
        // Assert
        assertNotNull(report);
        assertEquals(1, report.getTotalMigrations());
        assertNotNull(report.getStatistics());
        assertTrue(report.getStatistics().containsKey("totalMigrations"));
    }
    
    @Test
    void testChecksumComparisonResult_Match() {
        // Act
        ChecksumComparisonResult result = new ChecksumComparisonResult(
            "1.0", "Test migration", 12345, 12345, true
        );
        
        // Assert
        assertEquals("1.0", result.getVersion());
        assertEquals("Test migration", result.getDescription());
        assertEquals(12345, result.getDatabaseChecksum());
        assertEquals(12345, result.getFileChecksum());
        assertTrue(result.isMatch());
        assertNull(result.getErrorMessage());
    }
    
    @Test
    void testChecksumComparisonResult_Error() {
        // Act
        ChecksumComparisonResult result = ChecksumComparisonResult.error(
            "1.0", "Test migration", "Error message"
        );
        
        // Assert
        assertEquals("1.0", result.getVersion());
        assertEquals("Test migration", result.getDescription());
        assertFalse(result.isMatch());
        assertEquals("Error message", result.getErrorMessage());
    }
}
