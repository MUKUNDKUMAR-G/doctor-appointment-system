package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.AuditLogEntry;
import com.healthcare.appointmentsystem.entity.Severity;
import com.healthcare.appointmentsystem.repository.AuditLogRepository;
import net.jqwik.api.*;
import net.jqwik.api.constraints.NotBlank;
import net.jqwik.api.constraints.Positive;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for audit logging functionality
 * Feature: admin-interface-modernization
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuditLogPropertyTest {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @BeforeEach
    public void setUp() {
        auditLogRepository.deleteAll();
    }
    
    /**
     * Property 17: Admin action logging
     * For any administrative action performed, the system should create an audit log entry 
     * with action type, timestamp, administrator identity, and affected entity.
     * Validates: Requirements 15.1
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 17: Admin action logging")
    void adminActionsShouldBeLogged(
            @ForAll @NotBlank String action,
            @ForAll @NotBlank String entityType,
            @ForAll @Positive Long entityId,
            @ForAll @NotBlank String details,
            @ForAll @Positive Long adminId,
            @ForAll @NotBlank String adminName,
            @ForAll @NotBlank String ipAddress) {
        
        // When: An admin action is logged
        AuditLogEntry entry = auditLogService.logAction(
            action, entityType, entityId, details, adminId, adminName, ipAddress
        );
        
        // Then: The audit log entry should be created with all required fields
        assertThat(entry).isNotNull();
        assertThat(entry.getId()).isNotNull();
        assertThat(entry.getAction()).isEqualTo(action);
        assertThat(entry.getEntityType()).isEqualTo(entityType);
        assertThat(entry.getEntityId()).isEqualTo(entityId);
        assertThat(entry.getDetails()).isEqualTo(details);
        assertThat(entry.getAdminId()).isEqualTo(adminId);
        assertThat(entry.getAdminName()).isEqualTo(adminName);
        assertThat(entry.getIpAddress()).isEqualTo(ipAddress);
        assertThat(entry.getTimestamp()).isNotNull();
        assertThat(entry.getSeverity()).isNotNull();
        
        // And: The entry should be persisted in the database
        AuditLogEntry retrieved = auditLogRepository.findById(entry.getId()).orElse(null);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getAction()).isEqualTo(action);
        assertThat(retrieved.getAdminId()).isEqualTo(adminId);
    }
    
    /**
     * Property 17 (variant): Audit logs should preserve all action details
     * For any audit log entry, retrieving it from the database should return the same data
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 17: Audit log data preservation")
    void auditLogsShouldPreserveAllData(
            @ForAll @NotBlank String action,
            @ForAll @NotBlank String entityType,
            @ForAll @Positive Long entityId,
            @ForAll @NotBlank String details,
            @ForAll @Positive Long adminId,
            @ForAll @NotBlank String adminName,
            @ForAll @NotBlank String ipAddress,
            @ForAll Severity severity) {
        
        // When: An audit log is created with specific severity
        AuditLogEntry entry = auditLogService.logAction(
            action, entityType, entityId, details, adminId, adminName, ipAddress, severity
        );
        
        // Then: All fields should be preserved when retrieved
        AuditLogEntry retrieved = auditLogRepository.findById(entry.getId()).orElse(null);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getAction()).isEqualTo(action);
        assertThat(retrieved.getEntityType()).isEqualTo(entityType);
        assertThat(retrieved.getEntityId()).isEqualTo(entityId);
        assertThat(retrieved.getDetails()).isEqualTo(details);
        assertThat(retrieved.getAdminId()).isEqualTo(adminId);
        assertThat(retrieved.getAdminName()).isEqualTo(adminName);
        assertThat(retrieved.getIpAddress()).isEqualTo(ipAddress);
        assertThat(retrieved.getSeverity()).isEqualTo(severity);
    }
}
