package com.healthcare.appointmentsystem.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.concurrent.TimeUnit;

/**
 * Database configuration for production environment
 * Handles connection pooling, performance optimization, and maintenance tasks
 */
@Configuration
@EnableTransactionManagement
@EnableScheduling
@Profile("prod")
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maximumPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:600000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1800000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.leak-detection-threshold:60000}")
    private long leakDetectionThreshold;

    /**
     * Configure HikariCP connection pool for production
     */
    @Bean
    @Profile("prod")
    public DataSource productionDataSource() {
        HikariConfig config = new HikariConfig();
        
        // Basic connection settings
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        
        // Pool configuration
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setLeakDetectionThreshold(leakDetectionThreshold);
        
        // Pool name for monitoring
        config.setPoolName("AppointmentSystemCP");
        
        // Performance settings
        config.setAutoCommit(false);
        config.setConnectionTestQuery("SELECT 1");
        config.setValidationTimeout(5000);
        
        // MySQL specific optimizations
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        // Security settings
        config.addDataSourceProperty("allowLoadLocalInfile", "false");
        config.addDataSourceProperty("allowUrlInLocalInfile", "false");
        config.addDataSourceProperty("allowLoadLocalInfileInPath", "");
        
        // Connection validation
        config.addDataSourceProperty("validationQuery", "SELECT 1");
        config.addDataSourceProperty("testOnBorrow", "true");
        config.addDataSourceProperty("testWhileIdle", "true");
        
        return new HikariDataSource(config);
    }

    /**
     * Scheduled task to clean up expired reservations
     * Runs every 15 minutes to free up expired appointment slots
     */
    @Scheduled(fixedRate = 15, timeUnit = TimeUnit.MINUTES)
    public void cleanupExpiredReservations() {
        try (Connection connection = productionDataSource().getConnection()) {
            String sql = """
                UPDATE appointments 
                SET is_reserved = FALSE, reservation_expires_at = NULL 
                WHERE is_reserved = TRUE 
                  AND reservation_expires_at < NOW() 
                  AND status = 'SCHEDULED'
                """;
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                int updatedRows = statement.executeUpdate();
                if (updatedRows > 0) {
                    System.out.println("Cleaned up " + updatedRows + " expired reservations");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error cleaning up expired reservations: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to clean up expired session tokens
     * Runs daily at 2 AM to remove expired and revoked tokens
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredTokens() {
        try (Connection connection = productionDataSource().getConnection()) {
            String sql = """
                DELETE FROM session_tokens 
                WHERE expires_at < NOW() 
                   OR is_revoked = TRUE
                """;
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                int deletedRows = statement.executeUpdate();
                if (deletedRows > 0) {
                    System.out.println("Cleaned up " + deletedRows + " expired session tokens");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error cleaning up expired tokens: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to update table statistics
     * Runs weekly on Sunday at 3 AM to optimize query performance
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void updateTableStatistics() {
        try (Connection connection = productionDataSource().getConnection()) {
            String[] tables = {"users", "doctors", "appointments", "doctor_availabilities", "notification_logs"};
            
            for (String table : tables) {
                String sql = "ANALYZE TABLE " + table;
                try (PreparedStatement statement = connection.prepareStatement(sql)) {
                    statement.execute();
                }
            }
            System.out.println("Updated table statistics for performance optimization");
        } catch (SQLException e) {
            System.err.println("Error updating table statistics: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to archive old notification logs
     * Runs monthly on the 1st at 4 AM to keep database size manageable
     */
    @Scheduled(cron = "0 0 4 1 * *")
    public void archiveOldNotificationLogs() {
        try (Connection connection = productionDataSource().getConnection()) {
            String sql = """
                DELETE FROM notification_logs 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
                  AND status IN ('DELIVERED', 'FAILED')
                """;
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                int deletedRows = statement.executeUpdate();
                if (deletedRows > 0) {
                    System.out.println("Archived " + deletedRows + " old notification logs");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error archiving notification logs: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to archive old audit logs
     * Runs monthly on the 1st at 5 AM to maintain audit trail while managing size
     */
    @Scheduled(cron = "0 0 5 1 * *")
    public void archiveOldAuditLogs() {
        try (Connection connection = productionDataSource().getConnection()) {
            String sql = """
                DELETE FROM audit_logs 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 12 MONTH)
                """;
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                int deletedRows = statement.executeUpdate();
                if (deletedRows > 0) {
                    System.out.println("Archived " + deletedRows + " old audit logs");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error archiving audit logs: " + e.getMessage());
        }
    }
}