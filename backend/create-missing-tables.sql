-- Fix for missing migration tables
-- Run this script to create the missing tables that are preventing application startup

USE appointment_system;

-- Create migration_backups table (from V3 migration)
CREATE TABLE IF NOT EXISTS migration_backups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    compression_type VARCHAR(20),
    migration_version VARCHAR(50),
    retention_until DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    checksum VARCHAR(64)
);

-- Create migration_execution_log table (from V4 migration)
CREATE TABLE IF NOT EXISTS migration_execution_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    migration_version VARCHAR(50) NOT NULL,
    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    execution_duration_ms BIGINT,
    error_message TEXT,
    backup_reference VARCHAR(255),
    checksum_before VARCHAR(32),
    checksum_after VARCHAR(32)
);

-- Verify tables were created
SELECT 'Tables created successfully!' AS status;
SHOW TABLES LIKE 'migration%';
