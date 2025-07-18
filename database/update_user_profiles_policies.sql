-- Update User Profiles RLS Policies
-- Run this script if you already created the user_profiles table and need to fix the RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create updated policies with proper type casting
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid()::text = user_id);