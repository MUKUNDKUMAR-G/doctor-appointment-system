package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

/**
 * Database access control for migration operations
 * Ensures migration user has appropriate permissions
 * 
 * Requirements addressed:
 * - 4.1: Implement database access controls
 * - 3.5: Audit logging for database access
 */
@Component
public class DatabaseAccessControl {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseAccessControl.class);
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private MigrationSecurityService securityService;
    
    @Value("${spring.datasource.username}")
    private String databaseUser;
    
    @Value("${migration.security.require-permissions-check:true}")
    private boolean requirePermissionsCheck;
    
    // Required privileges for migration operations
    private static final Set<String> REQUIRED_PRIVILEGES = new HashSet<>();
    
    static {
        REQUIRED_PRIVILEGES.add("SELECT");
        REQUIRED_PRIVILEGES.add("INSERT");
        REQUIRED_PRIVILEGES.add("UPDATE");
        REQUIRED_PRIVILEGES.add("DELETE");
        REQUIRED_PRIVILEGES.add("CREATE");
        REQUIRED_PRIVILEGES.add("ALTER");
        REQUIRED_PRIVILEGES.add("DROP");
        REQUIRED_PRIVILEGES.add("INDEX");
        REQUIRED_PRIVILEGES.add("REFERENCES");
    }
    
    /**
     * Verify database user has required permissions
     * Requirement 4.1: Implement database access controls
     */
    public AccessControlResult verifyPermissions() {
        if (!requirePermissionsCheck) {
            logger.debug("Permission check disabled");
            return AccessControlResult.success("Permission check disabled");
        }
        
        logger.info("Verifying database permissions for user: {}", databaseUser);
        securityService.auditLog("PERMISSION_CHECK_START", "user=" + databaseUser);
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Get current user privileges
            String query = "SHOW GRANTS FOR CURRENT_USER()";
            ResultSet resultSet = statement.executeQuery(query);
            
            Set<String> grantedPrivileges = new HashSet<>();
            StringBuilder grantsInfo = new StringBuilder();
            
            while (resultSet.next()) {
                String grant = resultSet.getString(1);
                grantsInfo.append(grant).append("; ");
                
                // Parse privileges from GRANT statement
                if (grant.contains("ALL PRIVILEGES")) {
                    grantedPrivileges.addAll(REQUIRED_PRIVILEGES);
                } else {
                    for (String privilege : REQUIRED_PRIVILEGES) {
                        if (grant.toUpperCase().contains(privilege)) {
                            grantedPrivileges.add(privilege);
                        }
                    }
                }
            }
            
            // Check if all required privileges are granted
            Set<String> missingPrivileges = new HashSet<>(REQUIRED_PRIVILEGES);
            missingPrivileges.removeAll(grantedPrivileges);
            
            if (missingPrivileges.isEmpty()) {
                logger.info("All required permissions verified for user: {}", databaseUser);
                securityService.auditLog("PERMISSION_CHECK_SUCCESS", 
                    "user=" + databaseUser + ", privileges=" + grantedPrivileges);
                return AccessControlResult.success("All required permissions granted");
            } else {
                logger.warn("Missing required permissions for user {}: {}", 
                    databaseUser, missingPrivileges);
                securityService.auditSecurityViolation("INSUFFICIENT_PERMISSIONS",
                    "user=" + databaseUser + ", missing=" + missingPrivileges);
                return AccessControlResult.failure(
                    "Missing required permissions: " + missingPrivileges,
                    missingPrivileges
                );
            }
            
        } catch (Exception e) {
            logger.error("Failed to verify database permissions", e);
            securityService.auditLog("PERMISSION_CHECK_FAILED", 
                "user=" + databaseUser + ", error=" + e.getMessage());
            return AccessControlResult.failure(
                "Permission check failed: " + e.getMessage(),
                REQUIRED_PRIVILEGES
            );
        }
    }
    
    /**
     * Check if user has specific privilege
     */
    public boolean hasPrivilege(String privilege) {
        AccessControlResult result = verifyPermissions();
        return result.isSuccess() || !result.getMissingPrivileges().contains(privilege);
    }
    
    /**
     * Validate connection security
     * Requirement 4.1: Implement database access controls
     */
    public boolean validateConnectionSecurity() {
        logger.info("Validating database connection security");
        securityService.auditLog("CONNECTION_SECURITY_CHECK", "user=" + databaseUser);
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Check if SSL is enabled
            ResultSet resultSet = statement.executeQuery(
                "SHOW STATUS LIKE 'Ssl_cipher'"
            );
            
            boolean sslEnabled = false;
            if (resultSet.next()) {
                String sslCipher = resultSet.getString(2);
                sslEnabled = sslCipher != null && !sslCipher.isEmpty();
            }
            
            if (sslEnabled) {
                logger.info("Database connection is using SSL");
                securityService.auditLog("CONNECTION_SECURITY_OK", 
                    "user=" + databaseUser + ", ssl=enabled");
                return true;
            } else {
                logger.warn("Database connection is NOT using SSL");
                securityService.auditSecurityViolation("INSECURE_CONNECTION",
                    "user=" + databaseUser + ", ssl=disabled");
                return false;
            }
            
        } catch (Exception e) {
            logger.error("Failed to validate connection security", e);
            securityService.auditLog("CONNECTION_SECURITY_CHECK_FAILED",
                "user=" + databaseUser + ", error=" + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get database user information
     */
    public String getDatabaseUser() {
        return databaseUser;
    }
    
    /**
     * Result of access control check
     */
    public static class AccessControlResult {
        private final boolean success;
        private final String message;
        private final Set<String> missingPrivileges;
        
        private AccessControlResult(boolean success, String message, Set<String> missingPrivileges) {
            this.success = success;
            this.message = message;
            this.missingPrivileges = missingPrivileges;
        }
        
        public static AccessControlResult success(String message) {
            return new AccessControlResult(true, message, new HashSet<>());
        }
        
        public static AccessControlResult failure(String message, Set<String> missingPrivileges) {
            return new AccessControlResult(false, message, missingPrivileges);
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public Set<String> getMissingPrivileges() {
            return missingPrivileges;
        }
        
        @Override
        public String toString() {
            return "AccessControlResult{" +
                    "success=" + success +
                    ", message='" + message + '\'' +
                    ", missingPrivileges=" + missingPrivileges +
                    '}';
        }
    }
}
