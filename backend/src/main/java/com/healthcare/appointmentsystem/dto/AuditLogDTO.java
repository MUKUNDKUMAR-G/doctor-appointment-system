package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.Severity;
import java.time.LocalDateTime;

public class AuditLogDTO {
    private Long id;
    private LocalDateTime timestamp;
    private Long adminId;
    private String adminName;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private Severity severity;
    private String ipAddress;
    
    public AuditLogDTO() {}
    
    public AuditLogDTO(Long id, LocalDateTime timestamp, Long adminId, String adminName, String action, 
                      String entityType, Long entityId, String details, Severity severity, String ipAddress) {
        this.id = id;
        this.timestamp = timestamp;
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
