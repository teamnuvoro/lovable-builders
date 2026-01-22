-- Add firebase_uid column to users table for Firebase authentication
-- This migration adds support for Firebase Phone OTP authentication

-- Add firebase_uid column (nullable for existing users, unique for new ones)
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- Create unique index on firebase_uid for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID - used as primary identifier for phone OTP authentication';
