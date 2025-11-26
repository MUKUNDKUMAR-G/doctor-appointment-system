-- Add analytics cache table for performance optimization
-- This table stores pre-calculated analytics data to reduce query load

CREATE TABLE IF NOT EXISTS analytics_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_type VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_analytics_cache_key (cache_key),
    INDEX idx_analytics_cache_type (cache_type),
    INDEX idx_analytics_cache_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add additional indexes for audit_logs table to improve query performance
-- These indexes support common admin interface queries

-- Index for filtering by severity (critical actions)
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);

-- Composite index for date range queries with filtering
CREATE INDEX IF NOT EXISTS idx_audit_timestamp_severity ON audit_logs(timestamp, severity);

-- Composite index for admin-specific queries
CREATE INDEX IF NOT EXISTS idx_audit_admin_timestamp ON audit_logs(admin_id, timestamp);

-- Index for entity-specific audit trail queries
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Add indexes to appointments table for analytics queries
-- These support the analytics dashboard and reporting features

-- Index for appointment status distribution queries
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, appointment_date_time);

-- Index for doctor performance metrics
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status ON appointments(doctor_id, status);

-- Index for patient appointment history
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status ON appointments(patient_id, status);

-- Add indexes to users table for analytics queries

-- Index for user growth analytics
CREATE INDEX IF NOT EXISTS idx_users_created_role ON users(created_at, role);

-- Index for active user queries
CREATE INDEX IF NOT EXISTS idx_users_enabled_role ON users(enabled, role);

-- Add indexes to doctors table for analytics queries

-- Index for doctor availability analytics
CREATE INDEX IF NOT EXISTS idx_doctors_available_specialty ON doctors(is_available, specialty);

-- Add composite index for doctor availability queries
CREATE INDEX IF NOT EXISTS idx_doctor_avail_doctor_date_available ON doctor_availabilities(doctor_id, available_date, is_available);

-- Add index for date-based availability queries
CREATE INDEX IF NOT EXISTS idx_doctor_avail_date_available ON doctor_availabilities(available_date, is_available);

-- Comment explaining the analytics_cache table usage
-- The analytics_cache table is designed to store pre-calculated analytics data
-- Cache keys should follow the pattern: {metric_type}:{period}:{date_range}
-- Examples:
--   - "appointment_trends:30d:2024-01-01_2024-01-31"
--   - "user_growth:12m:2023-01-01_2024-01-01"
--   - "doctor_performance:all:latest"
-- 
-- The cache should be invalidated when relevant data changes:
--   - Appointment trends: when appointments are created/updated
--   - User growth: when users are created
--   - Doctor performance: when appointments are completed or ratings change
