-- Create migration_backups table for tracking backup metadata
-- Requirements addressed:
-- - 2.5: Backup metadata tracking and retention policy

CREATE TABLE migration_backups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    compression_type VARCHAR(20),
    migration_version VARCHAR(50),
    retention_until DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    checksum VARCHAR(64),
    
    INDEX idx_migration_version (migration_version),
    INDEX idx_created_at (created_at),
    INDEX idx_retention_until (retention_until),
    INDEX idx_is_verified (is_verified)
);

-- Create migration_execution_log table for detailed tracking
CREATE TABLE migration_execution_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    migration_version VARCHAR(50) NOT NULL,
    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL,
    execution_duration_ms BIGINT,
    error_message TEXT,
    backup_reference VARCHAR(255),
    checksum_before VARCHAR(32),
    checksum_after VARCHAR(32),
    
    INDEX idx_migration_version (migration_version),
    INDEX idx_execution_time (execution_time),
    INDEX idx_status (status),
    
    FOREIGN KEY (backup_reference) REFERENCES migration_backups(backup_name) ON DELETE SET NULL
);