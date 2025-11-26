package com.healthcare.appointmentsystem.migration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapter that bridges the domain repository interface with JPA repository
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
@Component
public class MigrationExecutionLogRepositoryAdapter implements MigrationExecutionLogRepository {
    
    @Autowired
    private JpaMigrationExecutionLogRepository jpaRepository;
    
    @Override
    public MigrationExecutionLog save(MigrationExecutionLog log) {
        MigrationExecutionLogEntity entity = MigrationExecutionLogEntity.fromDomain(log);
        MigrationExecutionLogEntity saved = jpaRepository.save(entity);
        return saved.toDomain();
    }
    
    @Override
    public List<MigrationExecutionLog> findByMigrationVersion(String migrationVersion) {
        return jpaRepository.findByMigrationVersion(migrationVersion)
                .stream()
                .map(MigrationExecutionLogEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MigrationExecutionLog> findByStatus(MigrationExecutionLog.Status status) {
        return jpaRepository.findByStatus(status)
                .stream()
                .map(MigrationExecutionLogEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MigrationExecutionLog> findByExecutionTimeBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return jpaRepository.findByExecutionTimeBetween(startTime, endTime)
                .stream()
                .map(MigrationExecutionLogEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public MigrationExecutionLog findLatestByMigrationVersion(String migrationVersion) {
        List<MigrationExecutionLogEntity> results = 
                jpaRepository.findByMigrationVersionOrderByExecutionTimeDesc(migrationVersion);
        
        if (results.isEmpty()) {
            return null;
        }
        
        return results.get(0).toDomain();
    }
    
    @Override
    public List<MigrationExecutionLog> findFailedExecutions() {
        return jpaRepository.findFailedExecutions()
                .stream()
                .map(MigrationExecutionLogEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public long countByMigrationVersion(String migrationVersion) {
        return jpaRepository.countByMigrationVersion(migrationVersion);
    }
}
