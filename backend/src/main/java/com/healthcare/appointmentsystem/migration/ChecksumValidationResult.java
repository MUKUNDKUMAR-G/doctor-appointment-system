package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Result object for checksum validation operations
 * Contains validation results and detailed comparison information
 */
public class ChecksumValidationResult {
    
    private final Map<String, ChecksumComparisonResult> comparisons;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    
    public ChecksumValidationResult() {
        this.comparisons = new HashMap<>();
        this.errors = new ArrayList<>();
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Adds a checksum comparison result for a migration
     * 
     * @param migrationVersion Migration version
     * @param comparison Comparison result
     */
    public void addComparison(String migrationVersion, ChecksumComparisonResult comparison) {
        this.comparisons.put(migrationVersion, comparison);
    }
    
    /**
     * Adds a validation error
     * 
     * @param error Error message
     */
    public void addError(String error) {
        this.errors.add(error);
    }
    
    /**
     * Gets all comparison results
     * 
     * @return Map of migration versions to comparison results
     */
    public Map<String, ChecksumComparisonResult> getComparisons() {
        return new HashMap<>(comparisons);
    }
    
    /**
     * Gets comparison result for a specific migration
     * 
     * @param migrationVersion Migration version
     * @return Comparison result or null if not found
     */
    public ChecksumComparisonResult getComparison(String migrationVersion) {
        return comparisons.get(migrationVersion);
    }
    
    /**
     * Gets all validation errors
     * 
     * @return List of error messages
     */
    public List<String> getErrors() {
        return new ArrayList<>(errors);
    }
    
    /**
     * Gets the timestamp when validation was performed
     * 
     * @return Validation timestamp
     */
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    /**
     * Gets the total number of migrations checked
     * 
     * @return Total migrations checked
     */
    public int getTotalChecked() {
        return comparisons.size();
    }
    
    /**
     * Gets the number of checksum mismatches
     * 
     * @return Number of mismatches
     */
    public int getMismatchCount() {
        return (int) comparisons.values().stream()
            .filter(comparison -> !comparison.isMatch())
            .count();
    }
    
    /**
     * Gets all migrations with checksum mismatches
     * 
     * @return List of migration versions with mismatches
     */
    public List<String> getMismatchedMigrations() {
        return comparisons.entrySet().stream()
            .filter(entry -> !entry.getValue().isMatch())
            .map(Map.Entry::getKey)
            .toList();
    }
    
    /**
     * Checks if there are any checksum mismatches
     * 
     * @return true if mismatches exist, false otherwise
     */
    public boolean hasMismatches() {
        return getMismatchCount() > 0;
    }
    
    /**
     * Checks if there are any validation errors
     * 
     * @return true if errors exist, false otherwise
     */
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    /**
     * Checks if validation passed (no errors or mismatches)
     * 
     * @return true if validation passed, false otherwise
     */
    public boolean isValid() {
        return !hasErrors() && !hasMismatches();
    }
    
    /**
     * Gets a summary of the validation results
     * 
     * @return Summary string
     */
    public String getSummary() {
        return String.format("Checksum validation: %d total, %d mismatches, %d errors", 
            getTotalChecked(), getMismatchCount(), errors.size());
    }
    
    @Override
    public String toString() {
        return "ChecksumValidationResult{" +
                "totalChecked=" + getTotalChecked() +
                ", mismatches=" + getMismatchCount() +
                ", errors=" + errors.size() +
                ", timestamp=" + timestamp +
                '}';
    }
}