-- Create migration execution log table for tracking migration activities

CREATE TABLE IF NOT EXISTS migration_execution_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    migration_version VARCHAR(50) NOT NULL,
    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'FAILED', 'ROLLED_BACK', 'SKIPPED') NOT NULL,
    execution_duration_ms BIGINT,
    error_message TEXT,
    backup_reference VARCHAR(255),
    checksum_before VARCHAR(32),
    checksum_after VARCHAR(32),
    executed_by VARCHAR(100),
    environment VARCHAR(50),
    INDEX idx_migration_version (migration_version),
    INDEX idx_execution_time (execution_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
