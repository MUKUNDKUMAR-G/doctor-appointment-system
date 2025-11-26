package com.healthcare.appointmentsystem.migration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * JPA Repository for migration execution log persistence
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
@Repository
public interface JpaMigrationExecutionLogRepository extends JpaRepository<MigrationExecutionLogEntity, Long> {
    
    List<MigrationExecutionLogEntity> findByMigrationVersion(String migrationVersion);
    
    List<MigrationExecutionLogEntity> findByStatus(MigrationExecutionLog.Status status);
    
    List<MigrationExecutionLogEntity> findByExecutionTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT m FROM MigrationExecutionLogEntity m WHERE m.migrationVersion = :version ORDER BY m.executionTime DESC")
    List<MigrationExecutionLogEntity> findByMigrationVersionOrderByExecutionTimeDesc(@Param("version") String version);
    
    @Query("SELECT m FROM MigrationExecutionLogEntity m WHERE m.status = 'FAILED' ORDER BY m.executionTime DESC")
    List<MigrationExecutionLogEntity> findFailedExecutions();
    
    long countByMigrationVersion(String migrationVersion);
}
