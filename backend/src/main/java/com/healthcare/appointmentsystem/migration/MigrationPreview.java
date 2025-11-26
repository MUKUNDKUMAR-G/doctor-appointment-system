package com.healthcare.appointmentsystem.migration;

import java.util.ArrayList;
import java.util.List;

/**
 * Preview information for a migration
 * Shows what will happen without executing
 * 
 * Requirements addressed:
 * - 2.4: Create migration preview functionality
 */
public class MigrationPreview {
    
    private String version;
    private String description;
    private String type;
    private String state;
    private String scriptPreview;
    private int scriptLength;
    private List<String> validationErrors = new ArrayList<>();
    private List<String> validationWarnings = new ArrayList<>();
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getScriptPreview() {
        return scriptPreview;
    }
    
    public void setScriptPreview(String scriptPreview) {
        this.scriptPreview = scriptPreview;
    }
    
    public int getScriptLength() {
        return scriptLength;
    }
    
    public void setScriptLength(int scriptLength) {
        this.scriptLength = scriptLength;
    }
    
    public List<String> getValidationErrors() {
        return validationErrors;
    }
    
    public void setValidationErrors(List<String> validationErrors) {
        this.validationErrors = validationErrors;
    }
    
    public List<String> getValidationWarnings() {
        return validationWarnings;
    }
    
    public void setValidationWarnings(List<String> validationWarnings) {
        this.validationWarnings = validationWarnings;
    }
    
    public boolean hasValidationErrors() {
        return !validationErrors.isEmpty();
    }
    
    public boolean hasValidationWarnings() {
        return !validationWarnings.isEmpty();
    }
    
    @Override
    public String toString() {
        return "MigrationPreview{" +
                "version='" + version + '\'' +
                ", description='" + description + '\'' +
                ", type='" + type + '\'' +
                ", state='" + state + '\'' +
                ", scriptLength=" + scriptLength +
                ", validationErrorsCount=" + validationErrors.size() +
                ", validationWarningsCount=" + validationWarnings.size() +
                '}';
    }
}
