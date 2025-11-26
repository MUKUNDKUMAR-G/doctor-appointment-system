package com.healthcare.appointmentsystem.migration;

/**
 * Result object for individual checksum comparisons
 * Contains comparison details for a single migration
 */
public class ChecksumComparisonResult {
    
    private final String migrationVersion;
    private final String description;
    private final Integer databaseChecksum;
    private final Integer fileChecksum;
    private final boolean isMatch;
    private final String errorMessage;
    
    /**
     * Constructor for successful comparison
     */
    public ChecksumComparisonResult(String migrationVersion, String description, 
                                  Integer databaseChecksum, Integer fileChecksum, boolean isMatch) {
        this.migrationVersion = migrationVersion;
        this.description = description;
        this.databaseChecksum = databaseChecksum;
        this.fileChecksum = fileChecksum;
        this.isMatch = isMatch;
        this.errorMessage = null;
    }
    
    /**
     * Constructor for error case
     */
    private ChecksumComparisonResult(String migrationVersion, String description, String errorMessage) {
        this.migrationVersion = migrationVersion;
        this.description = description;
        this.databaseChecksum = null;
        this.fileChecksum = null;
        this.isMatch = false;
        this.errorMessage = errorMessage;
    }
    
    /**
     * Creates an error comparison result
     */
    public static ChecksumComparisonResult error(String migrationVersion, String description, String errorMessage) {
        return new ChecksumComparisonResult(migrationVersion, description, errorMessage);
    }
    
    public String getMigrationVersion() {
        return migrationVersion;
    }
    
    public String getDescription() {
        return description;
    }
    
    public Integer getDatabaseChecksum() {
        return databaseChecksum;
    }
    
    public Integer getFileChecksum() {
        return fileChecksum;
    }
    
    public boolean isMatch() {
        return isMatch;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public boolean hasError() {
        return errorMessage != null;
    }
    
    /**
     * Gets a detailed description of the comparison result
     * 
     * @return Detailed description
     */
    public String getDetailedDescription() {
        if (hasError()) {
            return String.format("Migration %s (%s): ERROR - %s", 
                migrationVersion, description, errorMessage);
        }
        
        if (isMatch) {
            return String.format("Migration %s (%s): MATCH - checksum %s", 
                migrationVersion, description, databaseChecksum);
        } else {
            return String.format("Migration %s (%s): MISMATCH - database: %s, file: %s", 
                migrationVersion, description, databaseChecksum, fileChecksum);
        }
    }
    
    @Override
    public String toString() {
        return "ChecksumComparisonResult{" +
                "migrationVersion='" + migrationVersion + '\'' +
                ", description='" + description + '\'' +
                ", databaseChecksum=" + databaseChecksum +
                ", fileChecksum=" + fileChecksum +
                ", isMatch=" + isMatch +
                ", errorMessage='" + errorMessage + '\'' +
                '}';
    }
}