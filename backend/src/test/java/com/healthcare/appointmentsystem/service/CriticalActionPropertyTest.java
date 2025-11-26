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
 * Property-based tests for critical action highlighting
 * Feature: admin-interface-modernization
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CriticalActionPropertyTest {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @BeforeEach
    public void setUp() {
        auditLogRepository.deleteAll();
    }
    
    /**
     * Property 18: Critical action highlighting
     * For any critical action in the audit log, the system should display it with 
     * warning or error indicators to distinguish it from routine actions.
     * Validates: Requirements 15.3
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 18: Critical action highlighting")
    void criticalActionsShouldHaveHighSeverity(
            @ForAll("criticalActions") String action,
            @ForAll @NotBlank String entityType,
            @ForAll @Positive Long entityId,
            @ForAll @NotBlank String details,
            @ForAll @Positive Long adminId,
            @ForAll @NotBlank String adminName,
            @ForAll @NotBlank String ipAddress) {
        
        // When: A critical action is logged (delete, remove, disable, ban)
        AuditLogEntry entry = auditLogService.logAction(
            action, entityType, entityId, details, adminId, adminName, ipAddress
        );
        
        // Then: The severity should be CRITICAL to highlight it
        assertThat(entry.getSeverity()).isEqualTo(Severity.CRITICAL);
        
        // And: It should be distinguishable from INFO actions
        assertThat(entry.getSeverity()).isNotEqualTo(Severity.INFO);
    }
    
    /**
     * Property 18 (variant): Warning actions should have WARNING severity
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 18: Warning action highlighting")
    void warningActionsShouldHaveWarningSeverity(
            @ForAll("warningActions") String action,
            @ForAll @NotBlank String entityType,
            @ForAll @Positive Long entityId,
            @ForAll @NotBlank String details,
            @ForAll @Positive Long adminId,
            @ForAll @NotBlank String adminName,
            @ForAll @NotBlank String ipAddress) {
        
        // When: A warning-level action is logged (update, modify, change, verify)
        AuditLogEntry entry = auditLogService.logAction(
            action, entityType, entityId, details, adminId, adminName, ipAddress
        );
        
        // Then: The severity should be WARNING
        assertThat(entry.getSeverity()).isEqualTo(Severity.WARNING);
        
        // And: It should be distinguishable from INFO and CRITICAL
        assertThat(entry.getSeverity()).isNotEqualTo(Severity.INFO);
        assertThat(entry.getSeverity()).isNotEqualTo(Severity.CRITICAL);
    }
    
    /**
     * Property 18 (variant): Routine actions should have INFO severity
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 18: Routine action severity")
    void routineActionsShouldHaveInfoSeverity(
            @ForAll("routineActions") String action,
            @ForAll @NotBlank String entityType,
            @ForAll @Positive Long entityId,
            @ForAll @NotBlank String details,
            @ForAll @Positive Long adminId,
            @ForAll @NotBlank String adminName,
            @ForAll @NotBlank String ipAddress) {
        
        // When: A routine action is logged (view, list, get)
        AuditLogEntry entry = auditLogService.logAction(
            action, entityType, entityId, details, adminId, adminName, ipAddress
        );
        
        // Then: The severity should be INFO
        assertThat(entry.getSeverity()).isEqualTo(Severity.INFO);
    }
    
    // Arbitraries for different action types
    
    @Provide
    Arbitrary<String> criticalActions() {
        return Arbitraries.of(
            "DELETE_USER", "REMOVE_DOCTOR", "DISABLE_ACCOUNT", "BAN_USER",
            "delete_appointment", "remove_review", "disable_feature"
        );
    }
    
    @Provide
    Arbitrary<String> warningActions() {
        return Arbitraries.of(
            "UPDATE_USER", "MODIFY_DOCTOR", "CHANGE_ROLE", "VERIFY_CREDENTIAL",
            "update_appointment", "modify_settings", "change_password"
        );
    }
    
    @Provide
    Arbitrary<String> routineActions() {
        return Arbitraries.of(
            "VIEW_USER", "LIST_DOCTORS", "GET_APPOINTMENT", "READ_REPORT",
            "view_dashboard", "list_users", "get_statistics"
        );
    }
}
