package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.AuditLogEntry;
import com.healthcare.appointmentsystem.entity.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntry, Long> {
    
    Page<AuditLogEntry> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<AuditLogEntry> findByAdminId(Long adminId, Pageable pageable);
    
    Page<AuditLogEntry> findByAction(String action, Pageable pageable);
    
    Page<AuditLogEntry> findByEntityType(String entityType, Pageable pageable);
    
    Page<AuditLogEntry> findBySeverity(Severity severity, Pageable pageable);
    
    @Query("SELECT a FROM AuditLogEntry a WHERE " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) AND " +
           "(:adminId IS NULL OR a.adminId = :adminId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:severity IS NULL OR a.severity = :severity)")
    Page<AuditLogEntry> findByFilters(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("adminId") Long adminId,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("severity") Severity severity,
        Pageable pageable
    );
    
    List<AuditLogEntry> findTop100ByOrderByTimestampDesc();
}
