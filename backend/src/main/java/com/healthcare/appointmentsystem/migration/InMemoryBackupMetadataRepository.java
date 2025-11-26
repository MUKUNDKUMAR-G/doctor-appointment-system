package com.healthcare.appointmentsystem.migration;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory implementation of BackupMetadataRepository
 * Provides temporary storage for backup metadata during development
 * 
 * Note: This should be replaced with a proper database implementation in production
 * 
 * Requirements addressed:
 * - 2.5: Backup metadata tracking and retention policy
 */
@Repository
public class InMemoryBackupMetadataRepository implements BackupMetadataRepository {
    
    private final Map<Long, BackupMetadata> backups = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    
    @Override
    public BackupMetadata save(BackupMetadata metadata) {
        if (metadata.getId() == null) {
            metadata.setId(idGenerator.getAndIncrement());
        }
        backups.put(metadata.getId(), metadata);
        return metadata;
    }
    
    @Override
    public Optional<BackupMetadata> findById(Long id) {
        return Optional.ofNullable(backups.get(id));
    }
    
    @Override
    public Optional<BackupMetadata> findByBackupName(String backupName) {
        return backups.values().stream()
                .filter(backup -> Objects.equals(backup.getBackupName(), backupName))
                .findFirst();
    }
    
    @Override
    public List<BackupMetadata> findAll() {
        return new ArrayList<>(backups.values());
    }
    
    @Override
    public List<BackupMetadata> findByMigrationVersion(String migrationVersion) {
        return backups.values().stream()
                .filter(backup -> Objects.equals(backup.getMigrationVersion(), migrationVersion))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BackupMetadata> findExpiredBackups() {
        LocalDate today = LocalDate.now();
        return backups.values().stream()
                .filter(backup -> backup.getRetentionUntil() != null && 
                                today.isAfter(backup.getRetentionUntil()))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BackupMetadata> findUnverifiedBackups() {
        return backups.values().stream()
                .filter(backup -> !Boolean.TRUE.equals(backup.getIsVerified()))
                .collect(Collectors.toList());
    }
    
    @Override
    public void delete(BackupMetadata metadata) {
        if (metadata.getId() != null) {
            backups.remove(metadata.getId());
        }
    }
    
    @Override
    public void deleteById(Long id) {
        backups.remove(id);
    }
    
    @Override
    public long count() {
        return backups.size();
    }
    
    @Override
    public long getTotalBackupSize() {
        return backups.values().stream()
                .filter(backup -> backup.getFileSizeBytes() != null)
                .mapToLong(BackupMetadata::getFileSizeBytes)
                .sum();
    }
}