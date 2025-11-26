package com.healthcare.appointmentsystem.migration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Configuration properties for migration management
 * Binds to migration.* properties in application configuration
 * 
 * Requirements addressed:
 * - 1.5: Configuration properties binding
 * - 3.1: Environment-specific configurations
 * - 3.2: Validation annotations and constraints
 */
@Component
@ConfigurationProperties(prefix = "migration")
@Validated
public class MigrationProperties {
    
    /**
     * Whether to automatically repair checksum mismatches on startup
     * Requirement 1.1: Detect and resolve checksum mismatches automatically
     */
    @NotNull
    private Boolean autoRepair = true;
    
    /**
     * Timeout in seconds for migration validation operations
     * Requirement 1.5: Complete startup migration validation within 30 seconds
     */
    @NotNull
    @Min(1)
    @Max(300) // Maximum 5 minutes
    private Integer validationTimeout = 30;
    
    /**
     * Maximum number of retry attempts for failed operations
     */
    @NotNull
    @Min(1)
    @Max(10)
    private Integer maxRetryAttempts = 3;
    
    /**
     * Whether to create automatic backups before applying migrations
     * Requirement 2.1: Create automatic backups before schema changes
     */
    @NotNull
    private Boolean backupBeforeMigration = true;
    
    /**
     * Directory path for storing migration backups
     */
    private String backupDirectory = "data/backups";
    
    /**
     * Number of days to retain backup files
     */
    @Min(1)
    @Max(365)
    private Integer backupRetentionDays = 7;
    
    /**
     * Whether to enable dry-run mode for migrations
     */
    private Boolean dryRunMode = false;
    
    /**
     * Whether to enable detailed logging for migration operations
     */
    private Boolean detailedLogging = true;
    
    /**
     * Whether to validate migration naming conventions
     */
    private Boolean validateNamingConventions = true;
    
    /**
     * Whether to check for migration dependencies
     */
    private Boolean checkDependencies = true;
    
    /**
     * Whether to enable automatic backup cleanup
     */
    private Boolean backupCleanupEnabled = true;
    
    /**
     * Maximum number of backups to retain (regardless of age)
     */
    @Min(1)
    @Max(100)
    private Integer maxBackupsToRetain = 30;
    
    public Boolean getAutoRepair() {
        return autoRepair;
    }
    
    public void setAutoRepair(Boolean autoRepair) {
        this.autoRepair = autoRepair;
    }
    
    public Integer getValidationTimeout() {
        return validationTimeout;
    }
    
    public void setValidationTimeout(Integer validationTimeout) {
        this.validationTimeout = validationTimeout;
    }
    
    public Integer getMaxRetryAttempts() {
        return maxRetryAttempts;
    }
    
    public void setMaxRetryAttempts(Integer maxRetryAttempts) {
        this.maxRetryAttempts = maxRetryAttempts;
    }
    
    public Boolean getBackupBeforeMigration() {
        return backupBeforeMigration;
    }
    
    public void setBackupBeforeMigration(Boolean backupBeforeMigration) {
        this.backupBeforeMigration = backupBeforeMigration;
    }
    
    public String getBackupDirectory() {
        return backupDirectory;
    }
    
    public void setBackupDirectory(String backupDirectory) {
        this.backupDirectory = backupDirectory;
    }
    
    public Integer getBackupRetentionDays() {
        return backupRetentionDays;
    }
    
    public void setBackupRetentionDays(Integer backupRetentionDays) {
        this.backupRetentionDays = backupRetentionDays;
    }
    
    public Boolean getDryRunMode() {
        return dryRunMode;
    }
    
    public void setDryRunMode(Boolean dryRunMode) {
        this.dryRunMode = dryRunMode;
    }
    
    public Boolean getDetailedLogging() {
        return detailedLogging;
    }
    
    public void setDetailedLogging(Boolean detailedLogging) {
        this.detailedLogging = detailedLogging;
    }
    
    public Boolean getValidateNamingConventions() {
        return validateNamingConventions;
    }
    
    public void setValidateNamingConventions(Boolean validateNamingConventions) {
        this.validateNamingConventions = validateNamingConventions;
    }
    
    public Boolean getCheckDependencies() {
        return checkDependencies;
    }
    
    public void setCheckDependencies(Boolean checkDependencies) {
        this.checkDependencies = checkDependencies;
    }
    
    public Boolean getBackupCleanupEnabled() {
        return backupCleanupEnabled;
    }
    
    public void setBackupCleanupEnabled(Boolean backupCleanupEnabled) {
        this.backupCleanupEnabled = backupCleanupEnabled;
    }
    
    public Integer getMaxBackupsToRetain() {
        return maxBackupsToRetain;
    }
    
    public void setMaxBackupsToRetain(Integer maxBackupsToRetain) {
        this.maxBackupsToRetain = maxBackupsToRetain;
    }
    
    @Override
    public String toString() {
        return "MigrationProperties{" +
                "autoRepair=" + autoRepair +
                ", validationTimeout=" + validationTimeout +
                ", maxRetryAttempts=" + maxRetryAttempts +
                ", backupBeforeMigration=" + backupBeforeMigration +
                ", backupDirectory='" + backupDirectory + '\'' +
                ", backupRetentionDays=" + backupRetentionDays +
                ", dryRunMode=" + dryRunMode +
                ", detailedLogging=" + detailedLogging +
                ", validateNamingConventions=" + validateNamingConventions +
                ", checkDependencies=" + checkDependencies +
                ", backupCleanupEnabled=" + backupCleanupEnabled +
                ", maxBackupsToRetain=" + maxBackupsToRetain +
                '}';
    }
}