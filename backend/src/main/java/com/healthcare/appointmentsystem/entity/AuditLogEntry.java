package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_admin_id", columnList = "admin_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity_type", columnList = "entity_type")
})
public class AuditLogEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "admin_id", nullable = false)
    private Long adminId;
    
    @Column(name = "admin_name", nullable = false)
    private String adminName;
    
    @Column(nullable = false, length = 100)
    private String action;
    
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    // Constructors
    public AuditLogEntry() {
        this.timestamp = LocalDateTime.now();
        this.severity = Severity.INFO;
    }
    
    public AuditLogEntry(Long adminId, String adminName, String action, String entityType, Long entityId, String details, Severity severity, String ipAddress) {
        this();
        this.adminId = adminId;
        this.adminName = adminName;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.details = details;
        this.severity = severity;
        this.ipAddress = ipAddress;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Long getAdminId() {
        return adminId;
    }
    
    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }
    
    public String getAdminName() {
        return adminName;
    }
    
    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
    
    public Long getEntityId() {
        return entityId;
    }
    
    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public Severity getSeverity() {
        return severity;
    }
    
    public void setSeverity(Severity severity) {
        this.severity = severity;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
