package com.healthcare.appointmentsystem.migration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * JPA-based implementation of BackupMetadataRepository
 * Adapts JPA repository to domain repository interface
 * 
 * Requirements addressed:
 * - 2.5: Backup metadata tracking and retention policy
 */
@Repository
@Primary
public class JpaBackupMetadataRepositoryAdapter implements BackupMetadataRepository {
    
    private final JpaBackupMetadataRepository jpaRepository;
    
    @Autowired
    public JpaBackupMetadataRepositoryAdapter(JpaBackupMetadataRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public BackupMetadata save(BackupMetadata metadata) {
        BackupMetadataEntity entity = BackupMetadataEntity.fromDomainObject(metadata);
        BackupMetadataEntity savedEntity = jpaRepository.save(entity);
        return savedEntity.toDomainObject();
    }
    
    @Override
    public Optional<BackupMetadata> findById(Long id) {
        return jpaRepository.findById(id)
                .map(BackupMetadataEntity::toDomainObject);
    }
    
    @Override
    public Optional<BackupMetadata> findByBackupName(String backupName) {
        return jpaRepository.findByBackupName(backupName)
                .map(BackupMetadataEntity::toDomainObject);
    }
    
    @Override
    public List<BackupMetadata> findAll() {
        return jpaRepository.findAll().stream()
                .map(BackupMetadataEntity::toDomainObject)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BackupMetadata> findByMigrationVersion(String migrationVersion) {
        return jpaRepository.findByMigrationVersion(migrationVersion).stream()
                .map(BackupMetadataEntity::toDomainObject)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BackupMetadata> findExpiredBackups() {
        return jpaRepository.findExpiredBackups(LocalDate.now()).stream()
                .map(BackupMetadataEntity::toDomainObject)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BackupMetadata> findUnverifiedBackups() {
        return jpaRepository.findByIsVerifiedFalse().stream()
                .map(BackupMetadataEntity::toDomainObject)
                .collect(Collectors.toList());
    }
    
    @Override
    public void delete(BackupMetadata metadata) {
        if (metadata.getId() != null) {
            jpaRepository.deleteById(metadata.getId());
        }
    }
    
    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return jpaRepository.count();
    }
    
    @Override
    public long getTotalBackupSize() {
        Long totalSize = jpaRepository.getTotalBackupSize();
        return totalSize != null ? totalSize : 0L;
    }
}