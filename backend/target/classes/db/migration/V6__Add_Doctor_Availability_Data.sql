-- Add doctor availability data for all doctors
-- This creates recurring weekly availability schedules

-- Get doctor IDs dynamically and insert availability
-- Dr. Rajesh Sharma (Cardiology)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.sharma@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.sharma@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.sharma@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.sharma@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.sharma@healthcaresystem.com';

-- Dr. Priya Reddy (Pediatrics)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com'
UNION ALL
SELECT d.id, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.reddy@healthcaresystem.com';

-- Dr. Arun Kumar (Orthopedics)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com'
UNION ALL
SELECT d.id, 'SATURDAY', '09:00:00', '13:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.kumar@healthcaresystem.com';

-- Dr. Neha Patel (Dermatology)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com'
UNION ALL
SELECT d.id, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.patel@healthcaresystem.com';

-- Dr. Anjali Desai (Psychiatry)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '10:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com'
UNION ALL
SELECT d.id, 'SATURDAY', '10:00:00', '14:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.desai@healthcaresystem.com';

-- Dr. Suresh Nair (Ophthalmology)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.nair@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.nair@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.nair@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.nair@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '09:00:00', '17:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.nair@healthcaresystem.com';

-- Dr. Kavita Gupta (Dentistry)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes, created_at, updated_at)
SELECT d.id, 'MONDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com'
UNION ALL
SELECT d.id, 'TUESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com'
UNION ALL
SELECT d.id, 'WEDNESDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com'
UNION ALL
SELECT d.id, 'THURSDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com'
UNION ALL
SELECT d.id, 'FRIDAY', '09:00:00', '18:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com'
UNION ALL
SELECT d.id, 'SATURDAY', '09:00:00', '14:00:00', true, 30, NOW(), NOW()
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'dr.gupta@healthcaresystem.com';
