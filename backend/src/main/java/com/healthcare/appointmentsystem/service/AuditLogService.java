package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.AuditLogEntry;
import com.healthcare.appointmentsystem.entity.Severity;
import com.healthcare.appointmentsystem.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Transactional
    public AuditLogEntry logAction(String action, String entityType, Long entityId, String details, Long adminId, String adminName, String ipAddress) {
        Severity severity = determineSeverity(action);
        AuditLogEntry entry = new AuditLogEntry(adminId, adminName, action, entityType, entityId, details, severity, ipAddress);
        return auditLogRepository.save(entry);
    }
    
    @Transactional
    public AuditLogEntry logAction(String action, String entityType, Long entityId, String details, Long adminId, String adminName, String ipAddress, Severity severity) {
        AuditLogEntry entry = new AuditLogEntry(adminId, adminName, action, entityType, entityId, details, severity, ipAddress);
        return auditLogRepository.save(entry);
    }
    
    public Page<AuditLogEntry> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate, Long adminId, 
                                           String action, String entityType, Severity severity, Pageable pageable) {
        return auditLogRepository.findByFilters(startDate, endDate, adminId, action, entityType, severity, pageable);
    }
    
    public Page<AuditLogEntry> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate, pageable);
    }
    
    public Page<AuditLogEntry> getAuditLogsByAdmin(Long adminId, Pageable pageable) {
        return auditLogRepository.findByAdminId(adminId, pageable);
    }
    
    public Page<AuditLogEntry> getAuditLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }
    
    public Page<AuditLogEntry> getAuditLogsBySeverity(Severity severity, Pageable pageable) {
        return auditLogRepository.findBySeverity(severity, pageable);
    }
    
    private Severity determineSeverity(String action) {
        if (action == null) {
            return Severity.INFO;
        }
        
        String actionLower = action.toLowerCase();
        
        // Critical actions
        if (actionLower.contains("delete") || actionLower.contains("remove") || 
            actionLower.contains("disable") || actionLower.contains("ban")) {
            return Severity.CRITICAL;
        }
        
        // Warning actions
        if (actionLower.contains("update") || actionLower.contains("modify") || 
            actionLower.contains("change") || actionLower.contains("verify")) {
            return Severity.WARNING;
        }
        
        // Error actions
        if (actionLower.contains("error") || actionLower.contains("fail")) {
            return Severity.ERROR;
        }
        
        // Default to INFO
        return Severity.INFO;
    }
}
