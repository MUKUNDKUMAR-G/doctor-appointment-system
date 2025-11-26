package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Component for validating migration file checksums
 * Provides checksum calculation, comparison, and mismatch detection
 * 
 * Requirements addressed:
 * - 1.4: Verify all existing migrations against database records
 * - 3.4: Implement mismatch detection and reporting
 */
public class ChecksumValidator {
    
    private static final Logger logger = LoggerFactory.getLogger(ChecksumValidator.class);
    
    private DataSource dataSource;
    private Flyway flyway;
    
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void setFlyway(Flyway flyway) {
        this.flyway = flyway;
    }
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    @Autowired
    private MigrationProperties migrationProperties;
    
    /**
     * Validates all migration file checksums against database records
     * Requirement 1.4: Verify all existing migrations against database records
     * 
     * @return ChecksumValidationResult containing validation details
     */
    public ChecksumValidationResult validateAllChecksums() {
        logger.info("Starting comprehensive checksum validation");
        
        ChecksumValidationResult result = new ChecksumValidationResult();
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] migrations = infoService.all();
            
            for (MigrationInfo migration : migrations) {
                if (migration.getState().name().equals("SUCCESS") || 
                    migration.getState().name().equals("OUTDATED")) {
                    
                    ChecksumComparisonResult comparison = validateMigrationChecksum(migration);
                    result.addComparison(migration.getVersion().toString(), comparison);
                    
                    if (!comparison.isMatch()) {
                        logger.warn("Checksum mismatch detected for migration {}: expected={}, actual={}", 
                            migration.getVersion(), comparison.getDatabaseChecksum(), comparison.getFileChecksum());
                    }
                }
            }
            
            logger.info("Checksum validation completed. Total migrations checked: {}, Mismatches: {}", 
                result.getTotalChecked(), result.getMismatchCount());
            
        } catch (Exception e) {
            logger.error("Error during checksum validation", e);
            result.addError("Validation failed: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Validates checksum for a specific migration
     * Requirement 3.4: Implement mismatch detection and reporting
     * 
     * @param migration Migration to validate
     * @return ChecksumComparisonResult containing comparison details
     */
    public ChecksumComparisonResult validateMigrationChecksum(MigrationInfo migration) {
        logger.debug("Validating checksum for migration {}", migration.getVersion());
        
        try {
            // Get checksum from database (Flyway stores this)
            Integer databaseChecksum = migration.getChecksum();
            
            // Calculate checksum from file
            Integer fileChecksum = calculateFileChecksum(migration);
            
            boolean isMatch = (databaseChecksum != null && databaseChecksum.equals(fileChecksum)) ||
                             (databaseChecksum == null && fileChecksum == null);
            
            ChecksumComparisonResult result = new ChecksumComparisonResult(
                migration.getVersion().toString(),
                migration.getDescription(),
                databaseChecksum,
                fileChecksum,
                isMatch
            );
            
            if (!isMatch) {
                logger.debug("Checksum mismatch for migration {}: db={}, file={}", 
                    migration.getVersion(), databaseChecksum, fileChecksum);
            }
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error validating checksum for migration " + migration.getVersion(), e);
            return ChecksumComparisonResult.error(
                migration.getVersion().toString(),
                migration.getDescription(),
                "Checksum validation failed: " + e.getMessage()
            );
        }
    }
    
    /**
     * Calculates checksum for a migration file
     * Uses the same algorithm as Flyway (CRC32)
     * 
     * @param migration Migration info containing file details
     * @return Calculated checksum or null if file not found
     */
    public Integer calculateFileChecksum(MigrationInfo migration) {
        try {
            String migrationPath = buildMigrationFilePath(migration);
            Resource resource = resourceLoader.getResource(migrationPath);
            
            if (!resource.exists()) {
                logger.warn("Migration file not found: {}", migrationPath);
                return null;
            }
            
            return calculateChecksumFromResource(resource);
            
        } catch (Exception e) {
            logger.error("Error calculating checksum for migration " + migration.getVersion(), e);
            return null;
        }
    }
    
    /**
     * Calculates checksum from a resource using CRC32 algorithm
     * 
     * @param resource Resource to calculate checksum for
     * @return Calculated checksum
     * @throws IOException if resource cannot be read
     */
    private Integer calculateChecksumFromResource(Resource resource) throws IOException {
        try (InputStream inputStream = resource.getInputStream()) {
            byte[] content = inputStream.readAllBytes();
            
            // Use CRC32 algorithm like Flyway
            java.util.zip.CRC32 crc32 = new java.util.zip.CRC32();
            crc32.update(content);
            
            return (int) crc32.getValue();
            
        } catch (IOException e) {
            logger.error("Error reading resource for checksum calculation: {}", resource.getDescription(), e);
            throw e;
        }
    }
    
    /**
     * Builds the file path for a migration based on Flyway conventions
     * 
     * @param migration Migration info
     * @return File path string
     */
    private String buildMigrationFilePath(MigrationInfo migration) {
        // Flyway naming convention: V{version}__{description}.sql
        String version = migration.getVersion().toString();
        String description = migration.getDescription().replace(" ", "_");
        
        return String.format("classpath:db/migration/V%s__%s.sql", version, description);
    }
    
    /**
     * Recalculates checksums for all migration files
     * Useful for updating checksums after intentional file modifications
     * 
     * @return Map of migration versions to their recalculated checksums
     */
    public Map<String, Integer> recalculateAllChecksums() {
        logger.info("Recalculating checksums for all migration files");
        
        Map<String, Integer> checksums = new HashMap<>();
        
        try {
            Flyway flyway = createFlywayInstance();
            MigrationInfoService infoService = flyway.info();
            MigrationInfo[] migrations = infoService.all();
            
            for (MigrationInfo migration : migrations) {
                Integer checksum = calculateFileChecksum(migration);
                checksums.put(migration.getVersion().toString(), checksum);
                
                logger.debug("Recalculated checksum for migration {}: {}", 
                    migration.getVersion(), checksum);
            }
            
            logger.info("Recalculated checksums for {} migrations", checksums.size());
            
        } catch (Exception e) {
            logger.error("Error recalculating checksums", e);
        }
        
        return checksums;
    }
    
    /**
     * Generates a detailed checksum report for all migrations
     * 
     * @return ChecksumReport containing comprehensive checksum information
     */
    public ChecksumReport generateChecksumReport() {
        logger.info("Generating comprehensive checksum report");
        
        ChecksumReport report = new ChecksumReport();
        ChecksumValidationResult validation = validateAllChecksums();
        
        report.setValidationResult(validation);
        report.setTotalMigrations(validation.getTotalChecked());
        report.setMismatchCount(validation.getMismatchCount());
        report.setValidationTimestamp(java.time.LocalDateTime.now());
        
        // Add summary statistics
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalMigrations", validation.getTotalChecked());
        statistics.put("validChecksums", validation.getTotalChecked() - validation.getMismatchCount());
        statistics.put("invalidChecksums", validation.getMismatchCount());
        statistics.put("validationErrors", validation.getErrors().size());
        
        report.setStatistics(statistics);
        
        logger.info("Checksum report generated: {} total, {} mismatches, {} errors", 
            validation.getTotalChecked(), validation.getMismatchCount(), validation.getErrors().size());
        
        return report;
    }
    
    /**
     * Creates a Flyway instance with current configuration
     */
    private Flyway createFlywayInstance() {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .validateOnMigrate(true)
            .load();
    }
}