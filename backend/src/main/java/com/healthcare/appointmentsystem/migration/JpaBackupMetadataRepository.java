package com.healthcare.appointmentsystem.migration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository interface for BackupMetadataEntity
 * Provides database operations for backup metadata
 */
@Repository
public interface JpaBackupMetadataRepository extends JpaRepository<BackupMetadataEntity, Long> {
    
    /**
     * Finds backup metadata by backup name
     */
    Optional<BackupMetadataEntity> findByBackupName(String backupName);
    
    /**
     * Finds backup metadata for a specific migration version
     */
    List<BackupMetadataEntity> findByMigrationVersion(String migrationVersion);
    
    /**
     * Finds expired backups based on retention policy
     */
    @Query("SELECT b FROM BackupMetadataEntity b WHERE b.retentionUntil < :currentDate")
    List<BackupMetadataEntity> findExpiredBackups(LocalDate currentDate);
    
    /**
     * Finds unverified backups
     */
    List<BackupMetadataEntity> findByIsVerifiedFalse();
    
    /**
     * Calculates total size of all backups
     */
    @Query("SELECT COALESCE(SUM(b.fileSizeBytes), 0) FROM BackupMetadataEntity b WHERE b.fileSizeBytes IS NOT NULL")
    Long getTotalBackupSize();
    
    /**
     * Finds backups ordered by creation date (most recent first)
     */
    List<BackupMetadataEntity> findAllByOrderByCreatedAtDesc();
    
    /**
     * Finds verified backups ordered by creation date (most recent first)
     */
    List<BackupMetadataEntity> findByIsVerifiedTrueOrderByCreatedAtDesc();
}