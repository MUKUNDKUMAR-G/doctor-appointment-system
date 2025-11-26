package com.healthcare.appointmentsystem.migration;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity for migration execution log
 * Persists migration execution details to database
 * 
 * Requirements addressed:
 * - 3.5: Maintain detailed logs of all migration activities
 * - 4.2: Generate detailed error reports
 */
@Entity
@Table(name = "migration_execution_log")
public class MigrationExecutionLogEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "migration_version", nullable = false, length = 50)
    private String migrationVersion;
    
    @Column(name = "execution_time", nullable = false)
    private LocalDateTime executionTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MigrationExecutionLog.Status status;
    
    @Column(name = "execution_duration_ms")
    private Long executionDurationMs;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "backup_reference")
    private String backupReference;
    
    @Column(name = "checksum_before", length = 32)
    private String checksumBefore;
    
    @Column(name = "checksum_after", length = 32)
    private String checksumAfter;
    
    @Column(name = "executed_by", length = 100)
    private String executedBy;
    
    @Column(name = "environment", length = 50)
    private String environment;
    
    public MigrationExecutionLogEntity() {
    }
    
    public static MigrationExecutionLogEntity fromDomain(MigrationExecutionLog log) {
        MigrationExecutionLogEntity entity = new MigrationExecutionLogEntity();
        entity.setId(log.getId());
        entity.setMigrationVersion(log.getMigrationVersion());
        entity.setExecutionTime(log.getExecutionTime());
        entity.setStatus(log.getStatus());
        entity.setExecutionDurationMs(log.getExecutionDurationMs());
        entity.setErrorMessage(log.getErrorMessage());
        entity.setBackupReference(log.getBackupReference());
        entity.setChecksumBefore(log.getChecksumBefore());
        entity.setChecksumAfter(log.getChecksumAfter());
        entity.setExecutedBy(log.getExecutedBy());
        entity.setEnvironment(log.getEnvironment());
        return entity;
    }
    
    public MigrationExecutionLog toDomain() {
        return MigrationExecutionLog.builder()
                .migrationVersion(migrationVersion)
                .executionTime(executionTime)
                .status(status)
                .executionDurationMs(executionDurationMs)
                .errorMessage(errorMessage)
                .backupReference(backupReference)
                .checksumBefore(checksumBefore)
                .checksumAfter(checksumAfter)
                .executedBy(executedBy)
                .environment(environment)
                .build();
    }
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMigrationVersion() {
        return migrationVersion;
    }
    
    public void setMigrationVersion(String migrationVersion) {
        this.migrationVersion = migrationVersion;
    }
    
    public LocalDateTime getExecutionTime() {
        return executionTime;
    }
    
    public void setExecutionTime(LocalDateTime executionTime) {
        this.executionTime = executionTime;
    }
    
    public MigrationExecutionLog.Status getStatus() {
        return status;
    }
    
    public void setStatus(MigrationExecutionLog.Status status) {
        this.status = status;
    }
    
    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }
    
    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getBackupReference() {
        return backupReference;
    }
    
    public void setBackupReference(String backupReference) {
        this.backupReference = backupReference;
    }
    
    public String getChecksumBefore() {
        return checksumBefore;
    }
    
    public void setChecksumBefore(String checksumBefore) {
        this.checksumBefore = checksumBefore;
    }
    
    public String getChecksumAfter() {
        return checksumAfter;
    }
    
    public void setChecksumAfter(String checksumAfter) {
        this.checksumAfter = checksumAfter;
    }
    
    public String getExecutedBy() {
        return executedBy;
    }
    
    public void setExecutedBy(String executedBy) {
        this.executedBy = executedBy;
    }
    
    public String getEnvironment() {
        return environment;
    }
    
    public void setEnvironment(String environment) {
        this.environment = environment;
    }
}
