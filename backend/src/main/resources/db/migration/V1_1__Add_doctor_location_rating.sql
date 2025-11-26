-- Add location and rating columns to doctors table
-- This allows storing doctor location and ratings

ALTER TABLE doctors 
ADD COLUMN location VARCHAR(200) AFTER consultation_fee,
ADD COLUMN rating DECIMAL(2,1) DEFAULT 0.0 AFTER location;

-- Add index for location-based searches
CREATE INDEX idx_doctors_location ON doctors(location);

-- Add index for rating-based sorting
CREATE INDEX idx_doctors_rating ON doctors(rating);
