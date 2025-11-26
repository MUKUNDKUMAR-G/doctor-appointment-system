package com.healthcare.appointmentsystem.migration;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity for backup metadata
 * Maps to migration_backups table
 * 
 * Requirements addressed:
 * - 2.5: Backup metadata tracking and retention policy
 */
@Entity
@Table(name = "migration_backups")
public class BackupMetadataEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "backup_name", nullable = false, unique = true)
    private String backupName;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;
    
    @Column(name = "compression_type", length = 20)
    private String compressionType;
    
    @Column(name = "migration_version", length = 50)
    private String migrationVersion;
    
    @Column(name = "retention_until")
    private LocalDate retentionUntil;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "checksum", length = 64)
    private String checksum;
    
    public BackupMetadataEntity() {
        this.createdAt = LocalDateTime.now();
        this.isVerified = false;
    }
    
    public BackupMetadataEntity(String backupName, String filePath, Long fileSizeBytes) {
        this();
        this.backupName = backupName;
        this.filePath = filePath;
        this.fileSizeBytes = fileSizeBytes;
    }
    
    // Convert to domain object
    public BackupMetadata toDomainObject() {
        BackupMetadata metadata = new BackupMetadata();
        metadata.setId(this.id);
        metadata.setBackupName(this.backupName);
        metadata.setCreatedAt(this.createdAt);
        metadata.setFilePath(this.filePath);
        metadata.setFileSizeBytes(this.fileSizeBytes);
        metadata.setCompressionType(this.compressionType);
        metadata.setMigrationVersion(this.migrationVersion);
        metadata.setRetentionUntil(this.retentionUntil);
        metadata.setIsVerified(this.isVerified);
        metadata.setChecksum(this.checksum);
        return metadata;
    }
    
    // Create from domain object
    public static BackupMetadataEntity fromDomainObject(BackupMetadata metadata) {
        BackupMetadataEntity entity = new BackupMetadataEntity();
        entity.setId(metadata.getId());
        entity.setBackupName(metadata.getBackupName());
        entity.setCreatedAt(metadata.getCreatedAt());
        entity.setFilePath(metadata.getFilePath());
        entity.setFileSizeBytes(metadata.getFileSizeBytes());
        entity.setCompressionType(metadata.getCompressionType());
        entity.setMigrationVersion(metadata.getMigrationVersion());
        entity.setRetentionUntil(metadata.getRetentionUntil());
        entity.setIsVerified(metadata.getIsVerified());
        entity.setChecksum(metadata.getChecksum());
        return entity;
    }
    
    public boolean isExpired() {
        return retentionUntil != null && LocalDate.now().isAfter(retentionUntil);
    }
    
    // Getters and Setters
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
}