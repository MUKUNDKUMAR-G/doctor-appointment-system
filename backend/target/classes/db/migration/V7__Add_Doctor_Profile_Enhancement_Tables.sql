-- Migration V7: Add Doctor Profile Enhancement Tables and Columns
-- This migration adds new tables and columns for the doctor profile enhancement feature

-- Add new columns to doctors table
ALTER TABLE doctors ADD COLUMN profile_completeness INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE doctors ADD COLUMN verification_date TIMESTAMP;
ALTER TABLE doctors ADD COLUMN languages_spoken TEXT;
ALTER TABLE doctors ADD COLUMN education TEXT;
ALTER TABLE doctors ADD COLUMN awards TEXT;
ALTER TABLE doctors ADD COLUMN consultation_duration INTEGER DEFAULT 30;
ALTER TABLE doctors ADD COLUMN follow_up_fee DECIMAL(10,2);
ALTER TABLE doctors ADD COLUMN emergency_fee DECIMAL(10,2);

-- Create doctor_credentials table
CREATE TABLE doctor_credentials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_name VARCHAR(255),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_credentials_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create indexes for doctor_credentials
CREATE INDEX idx_doctor_credentials_doctor_id ON doctor_credentials(doctor_id);
CREATE INDEX idx_doctor_credentials_status ON doctor_credentials(verification_status);

-- Create doctor_reviews table
CREATE TABLE doctor_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    doctor_response TEXT,
    responded_at TIMESTAMP,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_reviews_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_reviews_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_reviews_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Create indexes for doctor_reviews
CREATE INDEX idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX idx_doctor_reviews_patient_id ON doctor_reviews(patient_id);
CREATE INDEX idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX idx_doctor_reviews_appointment_id ON doctor_reviews(appointment_id);

-- Create doctor_statistics table for cached analytics
CREATE TABLE doctor_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL UNIQUE,
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    total_patients INTEGER DEFAULT 0,
    returning_patients INTEGER DEFAULT 0,
    avg_consultation_time INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_rating DOUBLE DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    patient_satisfaction_rate DOUBLE DEFAULT 0.0,
    booking_conversion_rate DOUBLE DEFAULT 0.0,
    last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_statistics_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create index for doctor_statistics
CREATE INDEX idx_doctor_statistics_doctor_id ON doctor_statistics(doctor_id);

-- Initialize doctor_statistics for existing doctors
INSERT INTO doctor_statistics (doctor_id, last_calculated_at)
SELECT id, CURRENT_TIMESTAMP FROM doctors;

-- Update profile_completeness for existing doctors based on current data
UPDATE doctors 
SET profile_completeness = (
    CASE 
        WHEN specialty IS NOT NULL AND specialty != '' THEN 9
        ELSE 0
    END +
    CASE 
        WHEN qualifications IS NOT NULL AND qualifications != '' THEN 9
        ELSE 0
    END +
    CASE 
        WHEN experience_years IS NOT NULL AND experience_years > 0 THEN 9
        ELSE 0
    END +
    CASE 
        WHEN bio IS NOT NULL AND bio != '' THEN 9
        ELSE 0
    END +
    CASE 
        WHEN license_number IS NOT NULL AND license_number != '' THEN 9
        ELSE 0
    END +
    CASE 
        WHEN consultation_fee IS NOT NULL AND consultation_fee > 0 THEN 9
        ELSE 0
    END
);
