-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    admin_id BIGINT NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    severity VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_admin_id (admin_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
