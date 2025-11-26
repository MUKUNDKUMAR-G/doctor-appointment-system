package com.healthcare.appointmentsystem.migration;

import org.flywaydb.core.api.MigrationInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Component for validating migration files before execution
 * Implements SQL syntax validation, naming convention enforcement, and dependency checking
 * 
 * Requirements addressed:
 * - 5.1: Enforce naming conventions for migration files
 * - 5.2: Provide templates for common migration operations
 * - 5.3: Check for best practices compliance
 */
@Component
public class MigrationValidator {
    
    private static final Logger logger = LoggerFactory.getLogger(MigrationValidator.class);
    
    // Naming convention pattern: V{version}__{description}.sql
    private static final Pattern NAMING_PATTERN = Pattern.compile("^V\\d+(\\.\\d+)?__[A-Z][a-zA-Z0-9_]+\\.sql$");
    
    // SQL keywords that should be validated
    private static final Set<String> DESTRUCTIVE_OPERATIONS = Set.of(
        "DROP TABLE", "DROP DATABASE", "TRUNCATE", "DELETE FROM"
    );
    
    private Boolean validateNamingConventions = true;
    private Boolean checkDependencies = true;
    
    public void setValidateNamingConventions(Boolean validateNamingConventions) {
        this.validateNamingConventions = validateNamingConventions;
    }
    
    public void setCheckDependencies(Boolean checkDependencies) {
        this.checkDependencies = checkDependencies;
    }
    
    @Autowired
    private MigrationProperties migrationProperties;
    
    /**
     * Validates a migration file
     * 
     * @param migrationInfo Migration information from Flyway
     * @return ValidationResult containing validation status and any issues
     */
    public ValidationResult validateMigration(MigrationInfo migrationInfo) {
        ValidationResult result = new ValidationResult();
        
        if (migrationInfo == null) {
            result.addError("Migration info is null");
            return result;
        }
        
        String version = migrationInfo.getVersion() != null ? migrationInfo.getVersion().toString() : "unknown";
        String description = migrationInfo.getDescription();
        
        logger.debug("Validating migration: V{}__{}", version, description);
        
        // Validate naming convention
        if (migrationProperties.getValidateNamingConventions()) {
            validateNamingConvention(version, description, result);
        }
        
        // Validate SQL syntax (basic validation)
        validateSqlSyntax(migrationInfo, result);
        
        // Check for destructive operations
        checkDestructiveOperations(migrationInfo, result);
        
        return result;
    }
    
    /**
     * Validates naming convention for migration files
     * Requirement 5.1: Enforce naming conventions for migration files
     */
    private void validateNamingConvention(String version, String description, ValidationResult result) {
        if (description == null || description.trim().isEmpty()) {
            result.addError("Migration V" + version + " has empty description");
            return;
        }
        
        // Check description format
        if (!description.matches("^[A-Z][a-zA-Z0-9_]+$")) {
            result.addWarning("Migration V" + version + " description should start with uppercase and contain only alphanumeric characters and underscores: " + description);
        }
        
        // Check for reasonable description length
        if (description.length() > 100) {
            result.addError("Migration V" + version + " description is too long (>100 chars): " + description);
        }
        
        if (description.length() < 3) {
            result.addWarning("Migration V" + version + " description is too short (<3 chars): " + description);
        }
        
        // Check for common naming issues
        if (description.contains(" ")) {
            result.addError("Migration V" + version + " description contains spaces (use underscores): " + description);
        }
        
        if (description.toLowerCase().equals(description)) {
            result.addWarning("Migration V" + version + " description should use PascalCase or snake_case: " + description);
        }
    }
    
    /**
     * Validates SQL syntax in migration files
     * Requirement 5.3: Check for best practices compliance
     */
    private void validateSqlSyntax(MigrationInfo migrationInfo, ValidationResult result) {
        try {
            String script = migrationInfo.getScript();
            if (script == null || script.trim().isEmpty()) {
                result.addError("Migration V" + migrationInfo.getVersion() + " has empty SQL script");
                return;
            }
            
            String upperScript = script.toUpperCase();
            
            // Check for basic SQL syntax issues
            if (!upperScript.contains("CREATE") && !upperScript.contains("ALTER") && 
                !upperScript.contains("INSERT") && !upperScript.contains("UPDATE") &&
                !upperScript.contains("DROP") && !upperScript.contains("TRUNCATE")) {
                result.addWarning("Migration V" + migrationInfo.getVersion() + " does not contain common SQL operations");
            }
            
            // Check for missing semicolons at statement ends
            String[] statements = script.split(";");
            if (statements.length == 1 && script.length() > 50) {
                result.addWarning("Migration V" + migrationInfo.getVersion() + " may be missing semicolons between statements");
            }
            
            // Check for common SQL errors
            if (upperScript.contains("CREAT TABLE")) {
                result.addError("Migration V" + migrationInfo.getVersion() + " contains typo: 'CREAT TABLE' should be 'CREATE TABLE'");
            }
            
            if (upperScript.contains("SELCT")) {
                result.addError("Migration V" + migrationInfo.getVersion() + " contains typo: 'SELCT' should be 'SELECT'");
            }
            
        } catch (Exception e) {
            logger.warn("Could not validate SQL syntax for migration V{}: {}", 
                migrationInfo.getVersion(), e.getMessage());
            result.addWarning("Could not fully validate SQL syntax: " + e.getMessage());
        }
    }
    
    /**
     * Checks for destructive operations in migration files
     * Requirement 5.3: Prevent destructive operations without explicit confirmation
     */
    private void checkDestructiveOperations(MigrationInfo migrationInfo, ValidationResult result) {
        try {
            String script = migrationInfo.getScript();
            if (script == null) {
                return;
            }
            
            String upperScript = script.toUpperCase();
            
            for (String destructiveOp : DESTRUCTIVE_OPERATIONS) {
                if (upperScript.contains(destructiveOp)) {
                    result.addWarning("Migration V" + migrationInfo.getVersion() + 
                        " contains destructive operation: " + destructiveOp + 
                        ". Ensure this is intentional and properly reviewed.");
                }
            }
            
        } catch (Exception e) {
            logger.warn("Could not check for destructive operations in migration V{}: {}", 
                migrationInfo.getVersion(), e.getMessage());
        }
    }
    
    /**
     * Validates dependencies between migrations
     * Requirement 5.3: Check for best practices compliance
     */
    public DependencyValidationResult validateDependencies(List<MigrationInfo> migrations) {
        DependencyValidationResult result = new DependencyValidationResult();
        
        if (!migrationProperties.getCheckDependencies()) {
            logger.debug("Dependency checking is disabled");
            return result;
        }
        
        Set<String> createdTables = new HashSet<>();
        Set<String> droppedTables = new HashSet<>();
        
        for (MigrationInfo migration : migrations) {
            try {
                String script = migration.getScript();
                if (script == null) {
                    continue;
                }
                
                String upperScript = script.toUpperCase();
                
                // Track table creation
                if (upperScript.contains("CREATE TABLE")) {
                    String[] parts = upperScript.split("CREATE TABLE");
                    for (int i = 1; i < parts.length; i++) {
                        String tableName = extractTableName(parts[i]);
                        if (tableName != null) {
                            if (createdTables.contains(tableName) && !droppedTables.contains(tableName)) {
                                result.addError("Migration V" + migration.getVersion() + 
                                    " attempts to create table '" + tableName + "' which already exists");
                            }
                            createdTables.add(tableName);
                            droppedTables.remove(tableName);
                        }
                    }
                }
                
                // Track table drops
                if (upperScript.contains("DROP TABLE")) {
                    String[] parts = upperScript.split("DROP TABLE");
                    for (int i = 1; i < parts.length; i++) {
                        String tableName = extractTableName(parts[i]);
                        if (tableName != null) {
                            if (!createdTables.contains(tableName)) {
                                result.addWarning("Migration V" + migration.getVersion() + 
                                    " drops table '" + tableName + "' which was not created in tracked migrations");
                            }
                            droppedTables.add(tableName);
                        }
                    }
                }
                
                // Check for ALTER TABLE on non-existent tables
                if (upperScript.contains("ALTER TABLE")) {
                    String[] parts = upperScript.split("ALTER TABLE");
                    for (int i = 1; i < parts.length; i++) {
                        String tableName = extractTableName(parts[i]);
                        if (tableName != null && !createdTables.contains(tableName)) {
                            result.addWarning("Migration V" + migration.getVersion() + 
                                " alters table '" + tableName + "' which was not created in tracked migrations");
                        }
                    }
                }
                
            } catch (Exception e) {
                logger.warn("Error validating dependencies for migration V{}: {}", 
                    migration.getVersion(), e.getMessage());
            }
        }
        
        return result;
    }
    
    /**
     * Extracts table name from SQL statement
     */
    private String extractTableName(String sqlFragment) {
        try {
            // Remove IF EXISTS/IF NOT EXISTS
            sqlFragment = sqlFragment.replaceAll("IF\\s+NOT\\s+EXISTS\\s+", "")
                                     .replaceAll("IF\\s+EXISTS\\s+", "");
            
            // Get the first word (table name)
            String[] words = sqlFragment.trim().split("\\s+");
            if (words.length > 0) {
                String tableName = words[0].replaceAll("[`'\";(),]", "").trim();
                if (!tableName.isEmpty()) {
                    return tableName.toUpperCase();
                }
            }
        } catch (Exception e) {
            logger.debug("Could not extract table name from: {}", sqlFragment);
        }
        return null;
    }
    
    /**
     * Result class for validation operations
     */
    public static class ValidationResult {
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public void addWarning(String warning) {
            warnings.add(warning);
        }
        
        public boolean hasErrors() {
            return !errors.isEmpty();
        }
        
        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }
        
        public List<String> getErrors() {
            return new ArrayList<>(errors);
        }
        
        public List<String> getWarnings() {
            return new ArrayList<>(warnings);
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
    }
    
    /**
     * Result class for dependency validation
     */
    public static class DependencyValidationResult {
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public void addWarning(String warning) {
            warnings.add(warning);
        }
        
        public boolean hasErrors() {
            return !errors.isEmpty();
        }
        
        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }
        
        public List<String> getErrors() {
            return new ArrayList<>(errors);
        }
        
        public List<String> getWarnings() {
            return new ArrayList<>(warnings);
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
    }
}
