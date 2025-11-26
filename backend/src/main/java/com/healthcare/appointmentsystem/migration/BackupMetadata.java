package com.healthcare.appointmentsystem.migration;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Metadata information for database backups
 * Contains backup details for tracking and management
 * 
 * Requirements addressed:
 * - 2.5: Backup retention policy and metadata tracking
 */
public class BackupMetadata {
    
    private Long id;
    private String backupName;
    private LocalDateTime createdAt;
    private String filePath;
    private Long fileSizeBytes;
    private String compressionType;
    private String migrationVersion;
    private LocalDate retentionUntil;
    private Boolean isVerified;
    private String checksum;
    
    public BackupMetadata() {
        this.createdAt = LocalDateTime.now();
        this.isVerified = false;
    }
    
    public BackupMetadata(String backupName, String filePath, Long fileSizeBytes) {
        this();
        this.backupName = backupName;
        this.filePath = filePath;
        this.fileSizeBytes = fileSizeBytes;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBackupName() {
        return backupName;
    }
    
    public void setBackupName(String backupName) {
        this.backupName = backupName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }
    
    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }
    
    public String getCompressionType() {
        return compressionType;
    }
    
    public void setCompressionType(String compressionType) {
        this.compressionType = compressionType;
    }
    
    public String getMigrationVersion() {
        return migrationVersion;
    }
    
    public void setMigrationVersion(String migrationVersion) {
        this.migrationVersion = migrationVersion;
    }
    
    public LocalDate getRetentionUntil() {
        return retentionUntil;
    }
    
    public void setRetentionUntil(LocalDate retentionUntil) {
        this.retentionUntil = retentionUntil;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public String getChecksum() {
        return checksum;
    }
    
    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }
    
    public boolean isExpired() {
        return retentionUntil != null && LocalDate.now().isAfter(retentionUntil);
    }
    
    @Override
    public String toString() {
        return "BackupMetadata{" +
                "id=" + id +
                ", backupName='" + backupName + '\'' +
                ", createdAt=" + createdAt +
                ", filePath='" + filePath + '\'' +
                ", fileSizeBytes=" + fileSizeBytes +
                ", compressionType='" + compressionType + '\'' +
                ", migrationVersion='" + migrationVersion + '\'' +
                ", retentionUntil=" + retentionUntil +
                ", isVerified=" + isVerified +
                ", checksum='" + checksum + '\'' +
                '}';
    }
}