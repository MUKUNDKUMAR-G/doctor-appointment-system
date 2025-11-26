-- Create schedule_templates table for reusable schedule templates

CREATE TABLE IF NOT EXISTS schedule_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_schedule_template_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT chk_slot_duration CHECK (slot_duration_minutes >= 15 AND slot_duration_minutes <= 240),
    CONSTRAINT chk_time_range CHECK (start_time < end_time),
    
    INDEX idx_schedule_template_doctor (doctor_id),
    INDEX idx_schedule_template_name (template_name),
    UNIQUE KEY uk_doctor_template_name (doctor_id, template_name)
);
