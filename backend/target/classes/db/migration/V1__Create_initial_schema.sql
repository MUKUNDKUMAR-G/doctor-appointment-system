-- Initial database schema for Secure Appointment System
-- Version 1.0 - Production MySQL Schema

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create doctors table
CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialty VARCHAR(100) NOT NULL,
    qualifications VARCHAR(500) NOT NULL,
    bio TEXT,
    experience_years INT NOT NULL,
    license_number VARCHAR(20),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctors_specialty (specialty),
    INDEX idx_doctors_user_id (user_id),
    INDEX idx_doctors_available (is_available),
    INDEX idx_doctors_experience (experience_years)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create doctor_availabilities table
CREATE TABLE doctor_availabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
    available_date DATETIME,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_availability_doctor_day (doctor_id, day_of_week),
    INDEX idx_doctor_availability_doctor_date (doctor_id, available_date),
    INDEX idx_doctor_availability_date (available_date),
    
    CONSTRAINT chk_availability_time CHECK (start_time < end_time),
    CONSTRAINT chk_slot_duration CHECK (slot_duration_minutes >= 15 AND slot_duration_minutes <= 240)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create appointments table
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date_time DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    reason VARCHAR(500),
    duration_minutes INT NOT NULL DEFAULT 30,
    reservation_expires_at DATETIME,
    is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at DATETIME,
    cancellation_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_doctor_appointment_time (doctor_id, appointment_date_time),
    INDEX idx_appointments_patient_date (patient_id, appointment_date_time),
    INDEX idx_appointments_doctor_date (doctor_id, appointment_date_time),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_date (appointment_date_time),
    INDEX idx_appointments_reserved (is_reserved, reservation_expires_at),
    
    CONSTRAINT chk_duration CHECK (duration_minutes >= 15 AND duration_minutes <= 240)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_templates table
CREATE TABLE notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLATION', 'APPOINTMENT_RESCHEDULED') NOT NULL,
    channel ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_notification_templates_type (type),
    INDEX idx_notification_templates_channel (channel),
    INDEX idx_notification_templates_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_logs table
CREATE TABLE notification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT,
    type ENUM('APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLATION', 'APPOINTMENT_RESCHEDULED') NOT NULL,
    channel ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    recipient_email VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message_content TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    sent_at DATETIME,
    delivered_at DATETIME,
    read_at DATETIME,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_notification_logs_appointment (appointment_id),
    INDEX idx_notification_logs_recipient (recipient_email),
    INDEX idx_notification_logs_status (status),
    INDEX idx_notification_logs_sent_at (sent_at),
    INDEX idx_notification_logs_type (type),
    INDEX idx_notification_logs_retry (status, retry_count, max_retries)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table for security tracking
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create session_tokens table for JWT token management
CREATE TABLE session_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_type ENUM('ACCESS', 'REFRESH') NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_tokens_user (user_id),
    INDEX idx_session_tokens_hash (token_hash),
    INDEX idx_session_tokens_expires (expires_at),
    INDEX idx_session_tokens_active (is_revoked, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;