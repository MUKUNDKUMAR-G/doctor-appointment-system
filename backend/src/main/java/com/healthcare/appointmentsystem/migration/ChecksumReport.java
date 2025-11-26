package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Comprehensive checksum report containing validation results and statistics
 */
public class ChecksumReport {
    
    private ChecksumValidationResult validationResult;
    private int totalMigrations;
    private int mismatchCount;
    private LocalDateTime validationTimestamp;
    private Map<String, Object> statistics;
    
    public ChecksumReport() {
        this.statistics = new HashMap<>();
        this.validationTimestamp = LocalDateTime.now();
    }
    
    public ChecksumValidationResult getValidationResult() {
        return validationResult;
    }
    
    public void setValidationResult(ChecksumValidationResult validationResult) {
        this.validationResult = validationResult;
    }
    
    public int getTotalMigrations() {
        return totalMigrations;
    }
    
    public void setTotalMigrations(int totalMigrations) {
        this.totalMigrations = totalMigrations;
    }
    
    public int getMismatchCount() {
        return mismatchCount;
    }
    
    public void setMismatchCount(int mismatchCount) {
        this.mismatchCount = mismatchCount;
    }
    
    public LocalDateTime getValidationTimestamp() {
        return validationTimestamp;
    }
    
    public void setValidationTimestamp(LocalDateTime validationTimestamp) {
        this.validationTimestamp = validationTimestamp;
    }
    
    public Map<String, Object> getStatistics() {
        return new HashMap<>(statistics);
    }
    
    public void setStatistics(Map<String, Object> statistics) {
        this.statistics = statistics != null ? new HashMap<>(statistics) : new HashMap<>();
    }
    
    public void addStatistic(String key, Object value) {
        this.statistics.put(key, value);
    }
    
    /**
     * Gets the validation success rate as a percentage
     * 
     * @return Success rate (0-100)
     */
    public double getSuccessRate() {
        if (totalMigrations == 0) {
            return 100.0;
        }
        return ((double) (totalMigrations - mismatchCount) / totalMigrations) * 100.0;
    }
    
    /**
     * Checks if the overall validation passed
     * 
     * @return true if no mismatches or errors, false otherwise
     */
    public boolean isPassed() {
        return validationResult != null && validationResult.isValid();
    }
    
    /**
     * Gets a summary of the report
     * 
     * @return Summary string
     */
    public String getSummary() {
        return String.format("Checksum Report: %d migrations, %d mismatches (%.1f%% success rate)", 
            totalMigrations, mismatchCount, getSuccessRate());
    }
    
    @Override
    public String toString() {
        return "ChecksumReport{" +
                "totalMigrations=" + totalMigrations +
                ", mismatchCount=" + mismatchCount +
                ", successRate=" + String.format("%.1f%%", getSuccessRate()) +
                ", validationTimestamp=" + validationTimestamp +
                ", statistics=" + statistics +
                '}';
    }
}