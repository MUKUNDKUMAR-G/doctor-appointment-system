package com.healthcare.appointmentsystem.migration;

import java.util.ArrayList;
import java.util.List;

/**
 * Result object for migration validation operations
 * Contains validation status and detailed error information
 */
public class MigrationValidationResult {
    
    private final List<String> errors;
    private final List<String> checksumMismatches;
    
    public MigrationValidationResult() {
        this.errors = new ArrayList<>();
        this.checksumMismatches = new ArrayList<>();
    }
    
    /**
     * Adds a general validation error
     * 
     * @param error Error message to add
     */
    public void addError(String error) {
        this.errors.add(error);
    }
    
    /**
     * Adds a checksum mismatch error
     * 
     * @param mismatch Checksum mismatch description
     */
    public void addChecksumMismatch(String mismatch) {
        this.checksumMismatches.add(mismatch);
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
     * Checks if there are any checksum mismatches
     * 
     * @return true if checksum mismatches exist, false otherwise
     */
    public boolean hasChecksumMismatches() {
        return !checksumMismatches.isEmpty();
    }
    
    /**
     * Gets the count of checksum mismatches
     * 
     * @return Number of checksum mismatches
     */
    public int getChecksumMismatchCount() {
        return checksumMismatches.size();
    }
    
    /**
     * Gets all errors (general errors + checksum mismatches)
     * 
     * @return Combined list of all errors
     */
    public List<String> getErrors() {
        List<String> allErrors = new ArrayList<>(errors);
        allErrors.addAll(checksumMismatches);
        return allErrors;
    }
    
    /**
     * Gets only the general validation errors
     * 
     * @return List of general validation errors
     */
    public List<String> getValidationErrors() {
        return new ArrayList<>(errors);
    }
    
    /**
     * Gets only the checksum mismatch errors
     * 
     * @return List of checksum mismatch errors
     */
    public List<String> getChecksumMismatches() {
        return new ArrayList<>(checksumMismatches);
    }
    
    /**
     * Checks if the validation passed (no errors or mismatches)
     * 
     * @return true if validation passed, false otherwise
     */
    public boolean isValid() {
        return !hasErrors() && !hasChecksumMismatches();
    }
    
    /**
     * Gets all issues (alias for getErrors for compatibility)
     * 
     * @return Combined list of all errors and issues
     */
    public List<String> getIssues() {
        return getErrors();
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("MigrationValidationResult{");
        
        if (hasErrors()) {
            sb.append("errors=").append(errors.size());
        }
        
        if (hasChecksumMismatches()) {
            if (hasErrors()) sb.append(", ");
            sb.append("checksumMismatches=").append(checksumMismatches.size());
        }
        
        if (isValid()) {
            sb.append("status=VALID");
        }
        
        sb.append('}');
        return sb.toString();
    }
}