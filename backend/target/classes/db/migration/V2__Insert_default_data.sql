-- Insert default data for Secure Appointment System
-- Version 2.0 - Default notification templates and sample data

-- Insert default notification templates
INSERT INTO notification_templates (name, type, channel, subject, body_template, is_active) VALUES
('appointment_confirmation_email', 'APPOINTMENT_CONFIRMATION', 'EMAIL', 
 'Appointment Confirmation - {{doctorName}}', 
 'Dear {{patientName}},\n\nYour appointment has been confirmed with Dr. {{doctorName}}.\n\nAppointment Details:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nSpecialty: {{doctorSpecialty}}\nDuration: {{duration}} minutes\n\nLocation: Healthcare Center\nAddress: [Your clinic address]\n\nPlease arrive 15 minutes early for check-in.\n\nIf you need to reschedule or cancel, please do so at least 24 hours in advance.\n\nThank you,\nHealthcare Appointment System', 
 TRUE),

('appointment_reminder_email', 'APPOINTMENT_REMINDER', 'EMAIL', 
 'Appointment Reminder - Tomorrow at {{appointmentTime}}', 
 'Dear {{patientName}},\n\nThis is a reminder that you have an appointment tomorrow with Dr. {{doctorName}}.\n\nAppointment Details:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nSpecialty: {{doctorSpecialty}}\n\nPlease remember to:\n- Arrive 15 minutes early\n- Bring a valid ID\n- Bring your insurance card\n- Bring any relevant medical records\n\nIf you need to reschedule or cancel, please do so as soon as possible.\n\nThank you,\nHealthcare Appointment System', 
 TRUE),

('appointment_cancellation_email', 'APPOINTMENT_CANCELLATION', 'EMAIL', 
 'Appointment Cancelled - {{doctorName}}', 
 'Dear {{patientName}},\n\nYour appointment with Dr. {{doctorName}} has been cancelled.\n\nCancelled Appointment Details:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nReason: {{cancellationReason}}\n\nIf you would like to reschedule, please visit our website or call our office.\n\nWe apologize for any inconvenience.\n\nThank you,\nHealthcare Appointment System', 
 TRUE),

('appointment_rescheduled_email', 'APPOINTMENT_RESCHEDULED', 'EMAIL', 
 'Appointment Rescheduled - {{doctorName}}', 
 'Dear {{patientName}},\n\nYour appointment with Dr. {{doctorName}} has been rescheduled.\n\nNew Appointment Details:\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nSpecialty: {{doctorSpecialty}}\nDuration: {{duration}} minutes\n\nPrevious appointment was scheduled for: {{oldAppointmentDate}} at {{oldAppointmentTime}}\n\nPlease make note of the new date and time. We look forward to seeing you.\n\nThank you,\nHealthcare Appointment System', 
 TRUE),

('appointment_confirmation_sms', 'APPOINTMENT_CONFIRMATION', 'SMS', 
 'Appointment Confirmed', 
 'Healthcare System: Your appointment with Dr. {{doctorName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}. Please arrive 15 minutes early. Reply STOP to opt out.', 
 TRUE),

('appointment_reminder_sms', 'APPOINTMENT_REMINDER', 'SMS', 
 'Appointment Reminder', 
 'Healthcare System: Reminder - You have an appointment tomorrow with Dr. {{doctorName}} at {{appointmentTime}}. Please arrive 15 minutes early. Reply STOP to opt out.', 
 TRUE);

-- Insert sample admin user (password: Admin123!)
-- Note: In production, this should be created through proper admin setup process
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('admin@healthcaresystem.com', '$2a$10$QnFMtSsmBFmhSVWBngBbQ.2KpC8R3K3r47o8GG.ao1dJT8SUxhoPq', 'System', 'Administrator', '+1234567890', 'ADMIN', TRUE);

-- Insert sample specialties data (this could be a separate specialties table in future versions)
-- For now, we'll ensure consistent specialty names through application validation

-- Create indexes for better performance on frequently queried columns
CREATE INDEX idx_appointments_upcoming ON appointments (status, appointment_date_time);
CREATE INDEX idx_appointments_patient_upcoming ON appointments (patient_id, status, appointment_date_time);
CREATE INDEX idx_appointments_doctor_upcoming ON appointments (doctor_id, status, appointment_date_time);
CREATE INDEX idx_appointments_expired_reservations ON appointments (is_reserved, reservation_expires_at);

-- Insert sample doctors based in Bangalore, Karnataka, India
-- Password for all sample doctors: Doctor123!

-- Sample Doctor 1: Cardiologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.sharma@healthcaresystem.com', '$2a$10$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Rajesh', 'Sharma', '+91-9876543210', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.sharma@healthcaresystem.com'), 
 'Cardiology', 
 'MBBS, MD (Cardiology), FACC', 
 15, 
 1500.00, 
 'Koramangala, Bangalore, Karnataka', 
 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention. Affiliated with leading hospitals in Bangalore.', 
 4.8);

-- Sample Doctor 2: Pediatrician
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.reddy@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Priya', 'Reddy', '+91-9876543211', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.reddy@healthcaresystem.com'), 
 'Pediatrics', 
 'MBBS, MD (Pediatrics), IAP', 
 12, 
 1000.00, 
 'Indiranagar, Bangalore, Karnataka', 
 'Dedicated pediatrician with expertise in child healthcare, vaccinations, and developmental disorders. Child-friendly approach.', 
 4.9);

-- Sample Doctor 3: Orthopedic Surgeon
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.kumar@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Arun', 'Kumar', '+91-9876543212', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.kumar@healthcaresystem.com'), 
 'Orthopedics', 
 'MBBS, MS (Orthopedics), DNB', 
 18, 
 1800.00, 
 'Whitefield, Bangalore, Karnataka', 
 'Senior orthopedic surgeon specializing in joint replacement, sports injuries, and trauma care. Over 5000 successful surgeries.', 
 4.7);

-- Sample Doctor 4: Dermatologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.patel@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Neha', 'Patel', '+91-9876543213', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.patel@healthcaresystem.com'), 
 'Dermatology', 
 'MBBS, MD (Dermatology), IADVL', 
 10, 
 1200.00, 
 'Jayanagar, Bangalore, Karnataka', 
 'Expert dermatologist offering treatments for skin, hair, and nail conditions. Specializes in cosmetic dermatology and laser treatments.', 
 4.6);

-- Sample Doctor 5: General Physician
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.rao@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Venkat', 'Rao', '+91-9876543214', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.rao@healthcaresystem.com'), 
 'General Medicine', 
 'MBBS, MD (Internal Medicine)', 
 20, 
 800.00, 
 'Malleshwaram, Bangalore, Karnataka', 
 'Experienced general physician providing comprehensive primary care. Expert in managing chronic diseases like diabetes and hypertension.', 
 4.8);

-- Sample Doctor 6: Gynecologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.menon@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Lakshmi', 'Menon', '+91-9876543215', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.menon@healthcaresystem.com'), 
 'Gynecology', 
 'MBBS, MS (OB/GYN), FICOG', 
 14, 
 1300.00, 
 'HSR Layout, Bangalore, Karnataka', 
 'Compassionate gynecologist specializing in womens health, pregnancy care, and minimally invasive surgeries.', 
 4.9);

-- Sample Doctor 7: ENT Specialist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.singh@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Amarjeet', 'Singh', '+91-9876543216', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.singh@healthcaresystem.com'), 
 'ENT (Otolaryngology)', 
 'MBBS, MS (ENT), FICS', 
 16, 
 1400.00, 
 'Banashankari, Bangalore, Karnataka', 
 'ENT specialist with expertise in treating ear, nose, and throat disorders. Performs advanced endoscopic sinus surgeries.', 
 4.7);

-- Sample Doctor 8: Neurologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.iyer@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Ramesh', 'Iyer', '+91-9876543217', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.iyer@healthcaresystem.com'), 
 'Neurology', 
 'MBBS, DM (Neurology), FIAN', 
 13, 
 2000.00, 
 'Marathahalli, Bangalore, Karnataka', 
 'Neurologist specializing in stroke management, epilepsy, and movement disorders. Uses latest diagnostic and treatment methods.', 
 4.8);

-- Sample Doctor 9: Psychiatrist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.desai@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Anjali', 'Desai', '+91-9876543218', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.desai@healthcaresystem.com'), 
 'Psychiatry', 
 'MBBS, MD (Psychiatry), MRCPsych', 
 11, 
 1600.00, 
 'Rajajinagar, Bangalore, Karnataka', 
 'Compassionate psychiatrist providing treatment for depression, anxiety, and other mental health conditions. Offers both medication and therapy.', 
 4.9);

-- Sample Doctor 10: Ophthalmologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.nair@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Suresh', 'Nair', '+91-9876543219', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.nair@healthcaresystem.com'), 
 'Ophthalmology', 
 'MBBS, MS (Ophthalmology), FICO', 
 17, 
 1500.00, 
 'JP Nagar, Bangalore, Karnataka', 
 'Eye specialist with expertise in cataract surgery, LASIK, and retinal disorders. Performed over 10,000 successful eye surgeries.', 
 4.8);

-- Sample Doctor 11: Dentist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.gupta@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Kavita', 'Gupta', '+91-9876543220', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.gupta@healthcaresystem.com'), 
 'Dentistry', 
 'BDS, MDS (Prosthodontics)', 
 9, 
 900.00, 
 'BTM Layout, Bangalore, Karnataka', 
 'Skilled dentist offering comprehensive dental care including cosmetic dentistry, implants, and orthodontics. Pain-free treatments.', 
 4.7);

-- Sample Doctor 12: Endocrinologist
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, enabled) VALUES
('dr.krishnan@healthcaresystem.com', '\$2a\$10\$IehXl4r4S.V1F0kGl4tClO5t/Zgr7NBQLL1LSp2c3hM9gnqG71ka6', 'Meera', 'Krishnan', '+91-9876543221', 'DOCTOR', TRUE);

INSERT INTO doctors (user_id, specialty, qualifications, experience_years, consultation_fee, location, bio, rating) VALUES
((SELECT id FROM users WHERE email = 'dr.krishnan@healthcaresystem.com'), 
 'Endocrinology', 
 'MBBS, DM (Endocrinology)', 
 12, 
 1700.00, 
 'Electronic City, Bangalore, Karnataka', 
 'Endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. Personalized treatment plans.', 
 4.8);

