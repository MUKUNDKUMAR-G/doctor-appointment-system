package com.healthcare.appointmentsystem.migration;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of a dry-run migration operation
 * 
 * Requirements addressed:
 * - 2.4: Support dry-run mode for testing migrations without applying changes
 * - 5.4: Implement impact analysis reporting
 */
public class DryRunResult {
    
    private boolean success;
    private String message;
    private int pendingMigrationsCount;
    private List<MigrationPreview> migrationPreviews = new ArrayList<>();
    private ImpactAnalysis impactAnalysis;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private long executionTimeMs;
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public int getPendingMigrationsCount() {
        return pendingMigrationsCount;
    }
    
    public void setPendingMigrationsCount(int pendingMigrationsCount) {
        this.pendingMigrationsCount = pendingMigrationsCount;
    }
    
    public List<MigrationPreview> getMigrationPreviews() {
        return migrationPreviews;
    }
    
    public void setMigrationPreviews(List<MigrationPreview> migrationPreviews) {
        this.migrationPreviews = migrationPreviews;
    }
    
    public ImpactAnalysis getImpactAnalysis() {
        return impactAnalysis;
    }
    
    public void setImpactAnalysis(ImpactAnalysis impactAnalysis) {
        this.impactAnalysis = impactAnalysis;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    public void addError(String error) {
        this.errors.add(error);
    }
    
    public void addErrors(List<String> errors) {
        this.errors.addAll(errors);
    }
    
    public List<String> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
    
    public void addWarning(String warning) {
        this.warnings.add(warning);
    }
    
    public void addWarnings(List<String> warnings) {
        this.warnings.addAll(warnings);
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    public boolean hasWarnings() {
        return !warnings.isEmpty();
    }
    
    @Override
    public String toString() {
        return "DryRunResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", pendingMigrationsCount=" + pendingMigrationsCount +
                ", migrationPreviewsCount=" + migrationPreviews.size() +
                ", errorsCount=" + errors.size() +
                ", warningsCount=" + warnings.size() +
                ", executionTimeMs=" + executionTimeMs +
                '}';
    }
}
