-- Simple tier system setup without complex functions
-- Run this script to add the required columns

-- 1. Add isMemorized column to vocabulary table
ALTER TABLE vocabulary 
ADD COLUMN IF NOT EXISTS is_memorized BOOLEAN DEFAULT false;

-- 2. Add tier and memorizedCount columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'Apprentice';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS memorized_count INTEGER DEFAULT 0;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_memorized 
ON vocabulary(user_id, is_memorized);

CREATE INDEX IF NOT EXISTS idx_profiles_user_tier 
ON profiles(user_id, tier);

-- 4. Update existing user profiles to have default tier
UPDATE profiles 
SET tier = 'Apprentice', memorized_count = 0 
WHERE tier IS NULL OR memorized_count IS NULL;