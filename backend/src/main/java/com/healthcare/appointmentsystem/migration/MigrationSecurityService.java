package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Security service for database migration operations
 * Provides encryption, access control, and audit logging
 * 
 * Requirements addressed:
 * - 3.5: Audit logging for all migration activities
 * - 4.1: Security features for migration operations
 */
@Service
public class MigrationSecurityService {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationSecurityService.class);
    private static final Logger auditLogger = LoggerFactory.getLogger("MIGRATION_AUDIT");
    
    private static final String ENCRYPTION_ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;
    private static final int AES_KEY_SIZE = 256;
    
    @Value("${migration.security.encryption-enabled:true}")
    private boolean encryptionEnabled;
    
    @Value("${migration.security.encryption-key:}")
    private String encryptionKeyBase64;
    
    @Value("${migration.security.audit-enabled:true}")
    private boolean auditEnabled;
    
    private SecretKey encryptionKey;
    
    /**
     * Initialize encryption key
     */
    public void initialize() {
        if (encryptionEnabled) {
            try {
                if (encryptionKeyBase64 != null && !encryptionKeyBase64.isEmpty()) {
                    byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyBase64);
                    encryptionKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
                    logger.info("Encryption key loaded from configuration");
                } else {
                    encryptionKey = generateEncryptionKey();
                    logger.warn("Generated new encryption key - should be configured in production");
                }
            } catch (Exception e) {
                logger.error("Failed to initialize encryption key", e);
                throw new RuntimeException("Encryption initialization failed", e);
            }
        }
    }
    
    /**
     * Generate a new AES encryption key
     */
    private SecretKey generateEncryptionKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(AES_KEY_SIZE, new SecureRandom());
        return keyGenerator.generateKey();
    }
    
    /**
     * Encrypt a backup file
     * Requirement 3.5: Add backup encryption
     */
    public String encryptBackupFile(String backupFilePath) throws Exception {
        if (!encryptionEnabled) {
            logger.debug("Encryption disabled, skipping backup encryption");
            return backupFilePath;
        }
        
        if (encryptionKey == null) {
            initialize();
        }
        
        Path inputPath = Paths.get(backupFilePath);
        Path outputPath = Paths.get(backupFilePath + ".encrypted");
        
        logger.info("Encrypting backup file: {}", backupFilePath);
        auditLog("BACKUP_ENCRYPTION_START", "file=" + backupFilePath);
        
        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey, parameterSpec);
            
            // Read input file
            byte[] inputBytes = Files.readAllBytes(inputPath);
            
            // Encrypt
            byte[] encryptedBytes = cipher.doFinal(inputBytes);
            
            // Write IV and encrypted data to output file
            try (FileOutputStream fos = new FileOutputStream(outputPath.toFile())) {
                fos.write(iv);
                fos.write(encryptedBytes);
            }
            
            // Delete original unencrypted file
            Files.delete(inputPath);
            
            // Rename encrypted file to original name
            Files.move(outputPath, inputPath);
            
            logger.info("Backup file encrypted successfully: {}", backupFilePath);
            auditLog("BACKUP_ENCRYPTION_SUCCESS", "file=" + backupFilePath);
            
            return backupFilePath;
            
        } catch (Exception e) {
            logger.error("Failed to encrypt backup file: {}", backupFilePath, e);
            auditLog("BACKUP_ENCRYPTION_FAILED", "file=" + backupFilePath + ", error=" + e.getMessage());
            throw new RuntimeException("Backup encryption failed", e);
        }
    }
    
    /**
     * Decrypt a backup file
     * Requirement 3.5: Add backup encryption
     */
    public String decryptBackupFile(String encryptedFilePath) throws Exception {
        if (!encryptionEnabled) {
            logger.debug("Encryption disabled, skipping backup decryption");
            return encryptedFilePath;
        }
        
        if (encryptionKey == null) {
            initialize();
        }
        
        Path inputPath = Paths.get(encryptedFilePath);
        Path outputPath = Paths.get(encryptedFilePath + ".decrypted");
        
        logger.info("Decrypting backup file: {}", encryptedFilePath);
        auditLog("BACKUP_DECRYPTION_START", "file=" + encryptedFilePath);
        
        try {
            // Read encrypted file
            byte[] fileBytes = Files.readAllBytes(inputPath);
            
            // Extract IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(fileBytes, 0, iv, 0, GCM_IV_LENGTH);
            
            // Extract encrypted data
            byte[] encryptedBytes = new byte[fileBytes.length - GCM_IV_LENGTH];
            System.arraycopy(fileBytes, GCM_IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey, parameterSpec);
            
            // Decrypt
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            
            // Write decrypted data to output file
            Files.write(outputPath, decryptedBytes);
            
            logger.info("Backup file decrypted successfully: {}", encryptedFilePath);
            auditLog("BACKUP_DECRYPTION_SUCCESS", "file=" + encryptedFilePath);
            
            return outputPath.toString();
            
        } catch (Exception e) {
            logger.error("Failed to decrypt backup file: {}", encryptedFilePath, e);
            auditLog("BACKUP_DECRYPTION_FAILED", "file=" + encryptedFilePath + ", error=" + e.getMessage());
            throw new RuntimeException("Backup decryption failed", e);
        }
    }
    
    /**
     * Validate database access permissions
     * Requirement 4.1: Implement database access controls
     */
    public boolean validateDatabaseAccess(String operation) {
        auditLog("DATABASE_ACCESS_CHECK", "operation=" + operation);
        
        // In production, this would check actual database user permissions
        // For now, we log the access attempt
        logger.debug("Validating database access for operation: {}", operation);
        
        return true;
    }
    
    /**
     * Audit log for migration security events
     * Requirement 3.5: Create audit logging for all migration activities
     */
    public void auditLog(String eventType, String details) {
        if (!auditEnabled) {
            return;
        }
        
        String timestamp = java.time.Instant.now().toString();
        String logEntry = String.format("[%s] EVENT=%s, %s", timestamp, eventType, details);
        
        auditLogger.info(logEntry);
    }
    
    /**
     * Audit log for migration operations
     */
    public void auditMigrationOperation(String operation, String version, String status, String details) {
        String auditDetails = String.format(
            "operation=%s, version=%s, status=%s, details=%s",
            operation, version, status, details
        );
        auditLog("MIGRATION_OPERATION", auditDetails);
    }
    
    /**
     * Audit log for backup operations
     */
    public void auditBackupOperation(String operation, String backupName, String status, String details) {
        String auditDetails = String.format(
            "operation=%s, backup=%s, status=%s, details=%s",
            operation, backupName, status, details
        );
        auditLog("BACKUP_OPERATION", auditDetails);
    }
    
    /**
     * Audit log for security violations
     */
    public void auditSecurityViolation(String violationType, String details) {
        String auditDetails = String.format(
            "violation=%s, details=%s",
            violationType, details
        );
        auditLog("SECURITY_VIOLATION", auditDetails);
        logger.warn("Security violation detected: {} - {}", violationType, details);
    }
    
    /**
     * Get encryption key as Base64 string (for configuration)
     */
    public String getEncryptionKeyBase64() {
        if (encryptionKey == null) {
            try {
                initialize();
            } catch (Exception e) {
                logger.error("Failed to initialize encryption key", e);
                return null;
            }
        }
        return Base64.getEncoder().encodeToString(encryptionKey.getEncoded());
    }
    
    /**
     * Check if encryption is enabled
     */
    public boolean isEncryptionEnabled() {
        return encryptionEnabled;
    }
    
    /**
     * Check if audit logging is enabled
     */
    public boolean isAuditEnabled() {
        return auditEnabled;
    }
}
