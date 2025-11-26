package com.healthcare.appointmentsystem.migration;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing backup metadata
 * Provides data access operations for backup tracking
 * 
 * Requirements addressed:
 * - 2.5: Backup metadata tracking and retention policy
 */
public interface BackupMetadataRepository {
    
    /**
     * Saves backup metadata
     * 
     * @param metadata The backup metadata to save
     * @return The saved metadata with generated ID
     */
    BackupMetadata save(BackupMetadata metadata);
    
    /**
     * Finds backup metadata by ID
     * 
     * @param id The backup ID
     * @return Optional containing the metadata if found
     */
    Optional<BackupMetadata> findById(Long id);
    
    /**
     * Finds backup metadata by backup name
     * 
     * @param backupName The backup name
     * @return Optional containing the metadata if found
     */
    Optional<BackupMetadata> findByBackupName(String backupName);
    
    /**
     * Finds all backup metadata records
     * 
     * @return List of all backup metadata
     */
    List<BackupMetadata> findAll();
    
    /**
     * Finds backup metadata for a specific migration version
     * 
     * @param migrationVersion The migration version
     * @return List of backups for the specified version
     */
    List<BackupMetadata> findByMigrationVersion(String migrationVersion);
    
    /**
     * Finds expired backups based on retention policy
     * 
     * @return List of expired backup metadata
     */
    List<BackupMetadata> findExpiredBackups();
    
    /**
     * Finds unverified backups
     * 
     * @return List of unverified backup metadata
     */
    List<BackupMetadata> findUnverifiedBackups();
    
    /**
     * Deletes backup metadata
     * 
     * @param metadata The metadata to delete
     */
    void delete(BackupMetadata metadata);
    
    /**
     * Deletes backup metadata by ID
     * 
     * @param id The backup ID to delete
     */
    void deleteById(Long id);
    
    /**
     * Counts total number of backups
     * 
     * @return Total backup count
     */
    long count();
    
    /**
     * Calculates total size of all backups
     * 
     * @return Total size in bytes
     */
    long getTotalBackupSize();
}