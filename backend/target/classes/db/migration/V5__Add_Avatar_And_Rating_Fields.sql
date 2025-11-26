-- Add avatar URL field to users table
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500) NULL AFTER phone_number;

-- Add rating and review count fields to doctors table
ALTER TABLE doctors 
ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.0 AFTER consultation_fee,
ADD COLUMN review_count INT DEFAULT 0 AFTER rating;

-- Add index on rating for better query performance
CREATE INDEX idx_doctors_rating ON doctors(rating);
