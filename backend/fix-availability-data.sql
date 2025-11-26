-- Fix doctor availability data
-- This script inserts availability data into the correct table

-- First, clear any existing data
DELETE FROM doctor_availabilities;

-- Dr. Rajesh Sharma (Cardiology) - Doctor ID 1
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(1, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(1, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(1, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(1, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(1, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW());

-- Dr. Priya Reddy (Pediatrics) - Doctor ID 2
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(2, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(2, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(2, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(2, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(2, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(2, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Dr. Arun Kumar (Orthopedics) - Doctor ID 3
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(3, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(3, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(3, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(3, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(3, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(3, 'SATURDAY', '09:00:00', '13:00:00', true, 30, NOW(), NOW());

-- Dr. Neha Patel (Dermatology) - Doctor ID 4
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(4, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(4, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(4, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(4, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(4, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(4, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Dr. Anjali Desai (Psychiatry) - Doctor ID 5
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(5, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(5, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(5, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(5, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(5, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(5, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Dr. Suresh Nair (Ophthalmology) - Doctor ID 6
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(6, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(6, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(6, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(6, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(6, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW());

-- Dr. Kavita Gupta (Dentistry) - Doctor ID 7
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(7, 'MONDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(7, 'TUESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(7, 'WEDNESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(7, 'THURSDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(7, 'FRIDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(7, 'SATURDAY', '09:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Verify the data
SELECT COUNT(*) as total_availability_records FROM doctor_availabilities;
SELECT d.id, u.first_name, u.last_name, COUNT(da.id) as availability_count
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN doctor_availabilities da ON d.id = da.doctor_id
GROUP BY d.id, u.first_name, u.last_name
ORDER BY d.id;

-- Additional doctors (8-12)
-- Dr. Ramesh Iyer - Doctor ID 8
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(8, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(8, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(8, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(8, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(8, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW());

-- Dr. Anjali Desai - Doctor ID 9
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(9, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(9, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(9, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(9, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(9, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(9, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Dr. Suresh Nair - Doctor ID 10
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(10, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(10, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(10, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(10, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()),
(10, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW());

-- Dr. Kavita Gupta - Doctor ID 11
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(11, 'MONDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(11, 'TUESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(11, 'WEDNESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(11, 'THURSDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(11, 'FRIDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()),
(11, 'SATURDAY', '09:00:00', '14:00:00', true, 30, NOW(), NOW());

-- Dr. Meera Krishnan - Doctor ID 12
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
VALUES 
(12, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(12, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(12, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(12, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(12, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()),
(12, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW());
