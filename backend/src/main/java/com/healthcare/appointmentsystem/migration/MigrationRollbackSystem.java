package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.zip.GZIPInputStream;

/**
 * Service for handling migration rollbacks
 * Provides automatic, manual, and point-in-time rollback capabilities
 * 
 * Requirements addressed:
 * - 2.3: Automatic rollback on migration failure
 * - 2.4: Manual rollback capabilities and point-in-time rollback
 */
@Service
public class MigrationRollbackSystem {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationRollbackSystem.class);
    
    private final DataSource dataSource;
    private final Flyway flyway;
    private final BackupMetadataRepository backupMetadataRepository;
    private final MigrationProperties migrationProperties;
    
    @Autowired
    public MigrationRollbackSystem(DataSource dataSource,
                                 Flyway flyway,
                                 BackupMetadataRepository backupMetadataRepository,
                                 MigrationProperties migrationProperties) {
        this.dataSource = dataSource;
        this.flyway = flyway;
        this.backupMetadataRepository = backupMetadataRepository;
        this.migrationProperties = migrationProperties;
    }
    
    /**
     * Performs automatic rollback on migration failure
     * Requirement 2.3: Automatic rollback on migration failure
     * 
     * @param failedMigrationVersion The version that failed
     * @return RollbackResult containing operation details
     */
    public RollbackResult performAutomaticRollback(String failedMigrationVersion) {
        logger.warn("Performing automatic rollback for failed migration: {}", failedMigrationVersion);
        
        long startTime = System.currentTimeMillis();
        List<String> operations = new ArrayList<>();
        
        try {
            // Find the most recent backup before this migration
            Optional<BackupMetadata> backupOpt = findLatestBackupBeforeMigration(failedMigrationVersion);
            
            if (backupOpt.isEmpty()) {
                return RollbackResult.failure("No backup found for automatic rollback");
            }
            
            BackupMetadata backup = backupOpt.get();
            operations.add("Found backup: " + backup.getBackupName());
            
            // Restore from backup
            RollbackResult restoreResult = restoreFromBackup(backup, RollbackType.AUTOMATIC);
            operations.addAll(restoreResult.getOperationsPerformed());
            
            if (!restoreResult.isSuccess()) {
                return RollbackResult.builder()
                    .success(false)
                    .message("Automatic rollback failed during backup restoration")
                    .errors(restoreResult.getErrors())
                    .rollbackType(RollbackType.AUTOMATIC.name())
                    .targetVersion(failedMigrationVersion)
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .operationsPerformed(operations)
                    .build();
            }
            
            operations.add("Database restored from backup successfully");
            
            // Clean Flyway schema history for failed migration
            cleanFailedMigrationFromHistory(failedMigrationVersion);
            operations.add("Cleaned failed migration from schema history");
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            logger.info("Automatic rollback completed successfully in {}ms", executionTime);
            
            return RollbackResult.builder()
                .success(true)
                .message("Automatic rollback completed successfully")
                .rollbackType(RollbackType.AUTOMATIC.name())
                .targetVersion(failedMigrationVersion)
                .backupUsed(backup.getBackupName())
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
                
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Automatic rollback failed", e);
            
            return RollbackResult.builder()
                .success(false)
                .message("Automatic rollback failed: " + e.getMessage())
                .errors(List.of(e.getMessage()))
                .rollbackType(RollbackType.AUTOMATIC.name())
                .targetVersion(failedMigrationVersion)
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
        }
    }
    
    /**
     * Performs manual rollback to a specific version
     * Requirement 2.4: Manual rollback capabilities
     * 
     * @param targetVersion The version to rollback to
     * @return RollbackResult containing operation details
     */
    public RollbackResult performManualRollback(String targetVersion) {
        logger.info("Performing manual rollback to version: {}", targetVersion);
        
        long startTime = System.currentTimeMillis();
        List<String> operations = new ArrayList<>();
        
        try {
            // Find backup for target version
            Optional<BackupMetadata> backupOpt = findBackupForVersion(targetVersion);
            
            if (backupOpt.isEmpty()) {
                return RollbackResult.failure("No backup found for version: " + targetVersion);
            }
            
            BackupMetadata backup = backupOpt.get();
            operations.add("Found backup for version: " + backup.getBackupName());
            
            // Restore from backup
            RollbackResult restoreResult = restoreFromBackup(backup, RollbackType.MANUAL);
            operations.addAll(restoreResult.getOperationsPerformed());
            
            if (!restoreResult.isSuccess()) {
                return RollbackResult.builder()
                    .success(false)
                    .message("Manual rollback failed during backup restoration")
                    .errors(restoreResult.getErrors())
                    .rollbackType(RollbackType.MANUAL.name())
                    .targetVersion(targetVersion)
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .operationsPerformed(operations)
                    .build();
            }
            
            operations.add("Database restored to version " + targetVersion);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            logger.info("Manual rollback completed successfully in {}ms", executionTime);
            
            return RollbackResult.builder()
                .success(true)
                .message("Manual rollback to version " + targetVersion + " completed successfully")
                .rollbackType(RollbackType.MANUAL.name())
                .targetVersion(targetVersion)
                .backupUsed(backup.getBackupName())
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
                
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Manual rollback failed", e);
            
            return RollbackResult.builder()
                .success(false)
                .message("Manual rollback failed: " + e.getMessage())
                .errors(List.of(e.getMessage()))
                .rollbackType(RollbackType.MANUAL.name())
                .targetVersion(targetVersion)
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
        }
    }
    
    /**
     * Performs point-in-time rollback to specific migration version
     * Requirement 2.4: Point-in-time rollback functionality
     * 
     * @param targetVersion The specific version to rollback to
     * @param timestamp The timestamp for point-in-time recovery
     * @return RollbackResult containing operation details
     */
    public RollbackResult performPointInTimeRollback(String targetVersion, LocalDateTime timestamp) {
        logger.info("Performing point-in-time rollback to version: {} at time: {}", targetVersion, timestamp);
        
        long startTime = System.currentTimeMillis();
        List<String> operations = new ArrayList<>();
        
        try {
            // Find the closest backup to the specified timestamp
            Optional<BackupMetadata> backupOpt = findBackupClosestToTimestamp(timestamp);
            
            if (backupOpt.isEmpty()) {
                return RollbackResult.failure("No backup found for timestamp: " + timestamp);
            }
            
            BackupMetadata backup = backupOpt.get();
            operations.add("Found closest backup: " + backup.getBackupName() + " created at " + backup.getCreatedAt());
            
            // Restore from backup
            RollbackResult restoreResult = restoreFromBackup(backup, RollbackType.POINT_IN_TIME);
            operations.addAll(restoreResult.getOperationsPerformed());
            
            if (!restoreResult.isSuccess()) {
                return RollbackResult.builder()
                    .success(false)
                    .message("Point-in-time rollback failed during backup restoration")
                    .errors(restoreResult.getErrors())
                    .rollbackType(RollbackType.POINT_IN_TIME.name())
                    .targetVersion(targetVersion)
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .operationsPerformed(operations)
                    .build();
            }
            
            operations.add("Database restored to point-in-time: " + timestamp);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            logger.info("Point-in-time rollback completed successfully in {}ms", executionTime);
            
            return RollbackResult.builder()
                .success(true)
                .message("Point-in-time rollback completed successfully")
                .rollbackType(RollbackType.POINT_IN_TIME.name())
                .targetVersion(targetVersion)
                .backupUsed(backup.getBackupName())
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
                
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Point-in-time rollback failed", e);
            
            return RollbackResult.builder()
                .success(false)
                .message("Point-in-time rollback failed: " + e.getMessage())
                .errors(List.of(e.getMessage()))
                .rollbackType(RollbackType.POINT_IN_TIME.name())
                .targetVersion(targetVersion)
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
        }
    }
    
    /**
     * Performs emergency rollback using the most recent backup
     */
    public RollbackResult performEmergencyRollback() {
        logger.warn("Performing emergency rollback using most recent backup");
        
        long startTime = System.currentTimeMillis();
        List<String> operations = new ArrayList<>();
        
        try {
            // Find the most recent backup
            Optional<BackupMetadata> backupOpt = findMostRecentBackup();
            
            if (backupOpt.isEmpty()) {
                return RollbackResult.failure("No backup available for emergency rollback");
            }
            
            BackupMetadata backup = backupOpt.get();
            operations.add("Using most recent backup: " + backup.getBackupName());
            
            // Restore from backup
            RollbackResult restoreResult = restoreFromBackup(backup, RollbackType.EMERGENCY);
            operations.addAll(restoreResult.getOperationsPerformed());
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (restoreResult.isSuccess()) {
                logger.info("Emergency rollback completed successfully in {}ms", executionTime);
                
                return RollbackResult.builder()
                    .success(true)
                    .message("Emergency rollback completed successfully")
                    .rollbackType(RollbackType.EMERGENCY.name())
                    .backupUsed(backup.getBackupName())
                    .executionTimeMs(executionTime)
                    .operationsPerformed(operations)
                    .build();
            } else {
                return RollbackResult.builder()
                    .success(false)
                    .message("Emergency rollback failed during backup restoration")
                    .errors(restoreResult.getErrors())
                    .rollbackType(RollbackType.EMERGENCY.name())
                    .executionTimeMs(executionTime)
                    .operationsPerformed(operations)
                    .build();
            }
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Emergency rollback failed", e);
            
            return RollbackResult.builder()
                .success(false)
                .message("Emergency rollback failed: " + e.getMessage())
                .errors(List.of(e.getMessage()))
                .rollbackType(RollbackType.EMERGENCY.name())
                .executionTimeMs(executionTime)
                .operationsPerformed(operations)
                .build();
        }
    }
    
    private RollbackResult restoreFromBackup(BackupMetadata backup, RollbackType rollbackType) {
        List<String> operations = new ArrayList<>();
        
        try {
            Path backupPath = Paths.get(backup.getFilePath());
            
            if (!Files.exists(backupPath)) {
                return RollbackResult.failure("Backup file not found: " + backupPath);
            }
            
            operations.add("Backup file verified: " + backupPath);
            
            // Drop and recreate database
            String databaseName = extractDatabaseName();
            dropAndRecreateDatabase(databaseName);
            operations.add("Database dropped and recreated: " + databaseName);
            
            // Restore from backup file
            restoreDatabase(backupPath, databaseName);
            operations.add("Database restored from backup");
            
            return RollbackResult.builder()
                .success(true)
                .message("Backup restoration completed successfully")
                .rollbackType(rollbackType.name())
                .backupUsed(backup.getBackupName())
                .operationsPerformed(operations)
                .build();
                
        } catch (Exception e) {
            logger.error("Failed to restore from backup: " + backup.getBackupName(), e);
            return RollbackResult.failure("Backup restoration failed: " + e.getMessage());
        }
    }
    
    private void dropAndRecreateDatabase(String databaseName) throws SQLException {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Drop database
            statement.execute("DROP DATABASE IF EXISTS " + databaseName);
            
            // Create database
            statement.execute("CREATE DATABASE " + databaseName + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Use the database
            statement.execute("USE " + databaseName);
        }
    }
    
    private void restoreDatabase(Path backupPath, String databaseName) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(
            "mysql",
            "--host=localhost",
            "--port=3306",
            "--user=root",
            databaseName
        );
        
        // Set password via environment variable for security
        processBuilder.environment().put("MYSQL_PWD", "");
        
        Process process = processBuilder.start();
        
        // Read compressed backup and pipe to mysql
        try (FileInputStream fis = new FileInputStream(backupPath.toFile());
             GZIPInputStream gzis = new GZIPInputStream(fis);
             BufferedReader reader = new BufferedReader(new InputStreamReader(gzis))) {
            
            // Write to mysql process stdin
            try (var writer = process.outputWriter()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    writer.write(line);
                    writer.write(System.lineSeparator());
                }
            }
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("MySQL restore failed with exit code: " + exitCode);
        }
    }
    
    private void cleanFailedMigrationFromHistory(String failedVersion) throws SQLException {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Remove failed migration from Flyway schema history
            String sql = "DELETE FROM flyway_schema_history WHERE version = '" + failedVersion + "'";
            statement.execute(sql);
        }
    }
    
    private Optional<BackupMetadata> findLatestBackupBeforeMigration(String migrationVersion) {
        return backupMetadataRepository.findAll().stream()
            .filter(backup -> backup.getIsVerified())
            .filter(backup -> isVersionBefore(backup.getMigrationVersion(), migrationVersion))
            .max((b1, b2) -> b1.getCreatedAt().compareTo(b2.getCreatedAt()));
    }
    
    private Optional<BackupMetadata> findBackupForVersion(String version) {
        return backupMetadataRepository.findByMigrationVersion(version).stream()
            .filter(backup -> backup.getIsVerified())
            .findFirst();
    }
    
    private Optional<BackupMetadata> findBackupClosestToTimestamp(LocalDateTime timestamp) {
        return backupMetadataRepository.findAll().stream()
            .filter(backup -> backup.getIsVerified())
            .filter(backup -> backup.getCreatedAt().isBefore(timestamp) || backup.getCreatedAt().isEqual(timestamp))
            .max((b1, b2) -> b1.getCreatedAt().compareTo(b2.getCreatedAt()));
    }
    
    private Optional<BackupMetadata> findMostRecentBackup() {
        return backupMetadataRepository.findAll().stream()
            .filter(backup -> backup.getIsVerified())
            .max((b1, b2) -> b1.getCreatedAt().compareTo(b2.getCreatedAt()));
    }
    
    private boolean isVersionBefore(String version1, String version2) {
        // Simple version comparison - can be enhanced for semantic versioning
        if (version1 == null || version2 == null) {
            return false;
        }
        return version1.compareTo(version2) < 0;
    }
    
    private String extractDatabaseName() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            String url = connection.getMetaData().getURL();
            int lastSlash = url.lastIndexOf('/');
            int questionMark = url.indexOf('?', lastSlash);
            if (questionMark == -1) {
                return url.substring(lastSlash + 1);
            }
            return url.substring(lastSlash + 1, questionMark);
        }
    }
}