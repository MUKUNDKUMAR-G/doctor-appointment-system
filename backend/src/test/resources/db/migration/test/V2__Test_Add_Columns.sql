-- Test migration V2: Add columns to existing tables
ALTER TABLE test_users ADD COLUMN phone_number VARCHAR(20);
ALTER TABLE test_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE test_posts ADD COLUMN view_count INT DEFAULT 0;
ALTER TABLE test_posts ADD COLUMN updated_at TIMESTAMP NULL;
