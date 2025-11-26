package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPOutputStream;

/**
 * Service for creating and managing database backups
 * Provides pre-migration backup functionality with compression and verification
 * 
 * Requirements addressed:
 * - 2.1: Create automatic backups before schema changes
 * - 2.2: Backup compression and storage management
 * - 2.5: Backup verification and integrity checks
 */
public class DatabaseBackupService {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupService.class);
    
    private DataSource dataSource;
    private String backupDirectory;
    private Integer retentionDays;
    private BackupMetadataRepository backupMetadataRepository;
    
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void setBackupDirectory(String backupDirectory) {
        this.backupDirectory = backupDirectory;
    }
    
    public void setRetentionDays(Integer retentionDays) {
        this.retentionDays = retentionDays;
    }
    
    public void setBackupMetadataRepository(BackupMetadataRepository backupMetadataRepository) {
        this.backupMetadataRepository = backupMetadataRepository;
    }
    
    /**
     * Creates a pre-migration backup of the database
     * Requirement 2.1: Create automatic backups before schema changes
     * 
     * @param migrationVersion The version of migration being applied
     * @return BackupResult containing backup operation details
     */
    public BackupResult createPreMigrationBackup(String migrationVersion) {
        logger.info("Creating pre-migration backup for version: {}", migrationVersion);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Create backup directory if it doesn't exist
            Path backupDir = createBackupDirectory();
            
            // Generate backup filename
            String backupName = generateBackupName(migrationVersion);
            Path backupPath = backupDir.resolve(backupName + ".sql.gz");
            
            // Create the backup
            BackupMetadata metadata = performBackup(backupPath, migrationVersion);
            
            // Verify backup integrity
            boolean verified = verifyBackupIntegrity(backupPath, metadata);
            metadata.setIsVerified(verified);
            
            // Save metadata
            backupMetadataRepository.save(metadata);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            logger.info("Backup created successfully: {} ({}ms)", backupPath, executionTime);
            
            return BackupResult.builder()
                    .success(true)
                    .message("Pre-migration backup created successfully")
                    .backupFilePath(backupPath.toString())
                    .backupName(backupName)
                    .backupSizeBytes(metadata.getFileSizeBytes())
                    .executionTimeMs(executionTime)
                    .build();
                    
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Failed to create pre-migration backup", e);
            
            return BackupResult.builder()
                    .success(false)
                    .message("Failed to create backup: " + e.getMessage())
                    .errors(List.of(e.getMessage()))
                    .executionTimeMs(executionTime)
                    .build();
        }
    }
    
    /**
     * Verifies the integrity of a backup file
     * Requirement 2.5: Backup verification and integrity checks
     */
    public boolean verifyBackupIntegrity(Path backupPath, BackupMetadata metadata) {
        try {
            // Check if file exists and is readable
            if (!Files.exists(backupPath) || !Files.isReadable(backupPath)) {
                logger.warn("Backup file not accessible: {}", backupPath);
                return false;
            }
            
            // Verify file size matches metadata
            long actualSize = Files.size(backupPath);
            if (actualSize != metadata.getFileSizeBytes()) {
                logger.warn("Backup file size mismatch. Expected: {}, Actual: {}", 
                           metadata.getFileSizeBytes(), actualSize);
                return false;
            }
            
            // Calculate and verify checksum
            String calculatedChecksum = calculateFileChecksum(backupPath);
            if (metadata.getChecksum() != null && !metadata.getChecksum().equals(calculatedChecksum)) {
                logger.warn("Backup checksum mismatch. Expected: {}, Calculated: {}", 
                           metadata.getChecksum(), calculatedChecksum);
                return false;
            }
            
            // Update checksum if not set
            if (metadata.getChecksum() == null) {
                metadata.setChecksum(calculatedChecksum);
            }
            
            logger.debug("Backup integrity verified: {}", backupPath);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to verify backup integrity: " + backupPath, e);
            return false;
        }
    }
    
    /**
     * Cleans up expired backups based on retention policy
     * Requirement 2.5: Backup retention policy
     */
    public void cleanupExpiredBackups() {
        logger.info("Starting cleanup of expired backups");
        
        try {
            List<BackupMetadata> expiredBackups = backupMetadataRepository.findExpiredBackups();
            
            for (BackupMetadata backup : expiredBackups) {
                try {
                    Path backupPath = Paths.get(backup.getFilePath());
                    if (Files.exists(backupPath)) {
                        Files.delete(backupPath);
                        logger.debug("Deleted expired backup file: {}", backupPath);
                    }
                    
                    backupMetadataRepository.delete(backup);
                    logger.debug("Removed expired backup metadata: {}", backup.getBackupName());
                    
                } catch (Exception e) {
                    logger.error("Failed to cleanup backup: " + backup.getBackupName(), e);
                }
            }
            
            logger.info("Cleanup completed. Removed {} expired backups", expiredBackups.size());
            
        } catch (Exception e) {
            logger.error("Failed to cleanup expired backups", e);
        }
    }
    
    private Path createBackupDirectory() throws IOException {
        Path backupDir = Paths.get(backupDirectory);
        if (!Files.exists(backupDir)) {
            Files.createDirectories(backupDir);
            logger.debug("Created backup directory: {}", backupDir);
        }
        return backupDir;
    }
    
    private String generateBackupName(String migrationVersion) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String version = migrationVersion != null ? migrationVersion.replace(".", "_") : "unknown";
        return String.format("backup_%s_%s", version, timestamp);
    }
    
    private BackupMetadata performBackup(Path backupPath, String migrationVersion) throws SQLException, IOException, NoSuchAlgorithmException {
        BackupMetadata metadata = new BackupMetadata();
        metadata.setBackupName(backupPath.getFileName().toString().replace(".sql.gz", ""));
        metadata.setFilePath(backupPath.toString());
        metadata.setMigrationVersion(migrationVersion);
        metadata.setCompressionType("gzip");
        
        // Calculate retention date
        LocalDate retentionUntil = LocalDate.now().plusDays(retentionDays);
        metadata.setRetentionUntil(retentionUntil);
        
        try (Connection connection = dataSource.getConnection();
             FileOutputStream fos = new FileOutputStream(backupPath.toFile());
             GZIPOutputStream gzos = new GZIPOutputStream(fos);
             PrintWriter writer = new PrintWriter(gzos)) {
            
            // Get database name from connection URL
            String databaseName = extractDatabaseName(connection.getMetaData().getURL());
            
            // Create mysqldump command
            ProcessBuilder processBuilder = new ProcessBuilder(
                "mysqldump",
                "--host=" + extractHost(connection.getMetaData().getURL()),
                "--port=" + extractPort(connection.getMetaData().getURL()),
                "--user=" + extractUsername(connection.getMetaData().getURL()),
                "--single-transaction",
                "--routines",
                "--triggers",
                databaseName
            );
            
            // Set password via environment variable for security
            processBuilder.environment().put("MYSQL_PWD", extractPassword());
            
            Process process = processBuilder.start();
            
            // Read mysqldump output and write to compressed file
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    writer.println(line);
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("mysqldump failed with exit code: " + exitCode);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Backup process interrupted", e);
        }
        
        // Set file size
        long fileSize = Files.size(backupPath);
        metadata.setFileSizeBytes(fileSize);
        
        // Calculate checksum
        String checksum = calculateFileChecksum(backupPath);
        metadata.setChecksum(checksum);
        
        return metadata;
    }
    
    private String calculateFileChecksum(Path filePath) throws IOException, NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        
        try (InputStream fis = Files.newInputStream(filePath);
             BufferedInputStream bis = new BufferedInputStream(fis)) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = bis.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
        }
        
        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        
        return sb.toString();
    }
    
    // Helper methods for extracting database connection details
    private String extractDatabaseName(String url) {
        // Extract database name from JDBC URL
        int lastSlash = url.lastIndexOf('/');
        int questionMark = url.indexOf('?', lastSlash);
        if (questionMark == -1) {
            return url.substring(lastSlash + 1);
        }
        return url.substring(lastSlash + 1, questionMark);
    }
    
    private String extractHost(String url) {
        // Extract host from JDBC URL (default to localhost)
        if (url.contains("//")) {
            String hostPart = url.substring(url.indexOf("//") + 2);
            int colonIndex = hostPart.indexOf(':');
            int slashIndex = hostPart.indexOf('/');
            
            if (colonIndex != -1 && (slashIndex == -1 || colonIndex < slashIndex)) {
                return hostPart.substring(0, colonIndex);
            } else if (slashIndex != -1) {
                return hostPart.substring(0, slashIndex);
            }
        }
        return "localhost";
    }
    
    private String extractPort(String url) {
        // Extract port from JDBC URL (default to 3306)
        if (url.contains("//")) {
            String hostPart = url.substring(url.indexOf("//") + 2);
            int colonIndex = hostPart.indexOf(':');
            int slashIndex = hostPart.indexOf('/');
            
            if (colonIndex != -1 && (slashIndex == -1 || colonIndex < slashIndex)) {
                String portPart = hostPart.substring(colonIndex + 1);
                int endIndex = portPart.indexOf('/');
                if (endIndex != -1) {
                    return portPart.substring(0, endIndex);
                }
                return portPart;
            }
        }
        return "3306";
    }
    
    private String extractUsername(String url) {
        // This would typically come from DataSource configuration
        // For now, return a default that should be configured via properties
        return "root";
    }
    
    private String extractPassword() {
        // This would typically come from DataSource configuration
        // For now, return empty string - should be configured via environment
        return "";
    }
}