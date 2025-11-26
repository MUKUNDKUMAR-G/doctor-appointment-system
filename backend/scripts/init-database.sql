-- Production Database Initialization Script
-- Run this script as MySQL root user to set up the production database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS appointment_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create application user with limited privileges
CREATE USER IF NOT EXISTS 'appointment_user'@'%' IDENTIFIED BY 'appointment_password';
CREATE USER IF NOT EXISTS 'appointment_user'@'localhost' IDENTIFIED BY 'appointment_password';

-- Grant necessary privileges to the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_system.* TO 'appointment_user'@'%';
GRANT CREATE, ALTER, DROP, INDEX ON appointment_system.* TO 'appointment_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_system.* TO 'appointment_user'@'localhost';
GRANT CREATE, ALTER, DROP, INDEX ON appointment_system.* TO 'appointment_user'@'localhost';

-- Create read-only user for reporting/analytics
CREATE USER IF NOT EXISTS 'appointment_readonly'@'%' IDENTIFIED BY 'CHANGE_THIS_READONLY_PASSWORD';
GRANT SELECT ON appointment_system.* TO 'appointment_readonly'@'%';

-- Create backup user
CREATE USER IF NOT EXISTS 'appointment_backup'@'localhost' IDENTIFIED BY 'CHANGE_THIS_BACKUP_PASSWORD';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON appointment_system.* TO 'appointment_backup'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Set MySQL configuration for production
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB, adjust based on available RAM
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 1; -- ACID compliance
SET GLOBAL sync_binlog = 1; -- Binary log sync for replication
SET GLOBAL max_connections = 200; -- Adjust based on expected load
SET GLOBAL wait_timeout = 28800; -- 8 hours
SET GLOBAL interactive_timeout = 28800; -- 8 hours

-- Enable slow query log for performance monitoring
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries taking more than 2 seconds
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Security settings
SET GLOBAL local_infile = 'OFF'; -- Disable LOAD DATA LOCAL INFILE
SET GLOBAL secure_file_priv = '/var/lib/mysql-files/'; -- Restrict file operations

USE appointment_system;

-- Create additional performance indexes after initial migration
-- These will be created by the application, but listed here for reference

-- Composite indexes for common query patterns
-- CREATE INDEX idx_appointments_patient_status_date ON appointments (patient_id, status, appointment_date_time);
-- CREATE INDEX idx_appointments_doctor_status_date ON appointments (doctor_id, status, appointment_date_time);
-- CREATE INDEX idx_doctor_availability_composite ON doctor_availabilities (doctor_id, is_available, day_of_week, start_time);

-- Partial indexes for active records (MySQL 8.0+)
-- CREATE INDEX idx_users_active ON users (id, email) WHERE enabled = TRUE;
-- CREATE INDEX idx_doctors_active ON doctors (id, specialty) WHERE is_available = TRUE;

SHOW DATABASES;
SHOW GRANTS FOR 'appointment_user'@'%';
SELECT 'Database initialization completed successfully' AS status;