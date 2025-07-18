-- Add memorized tracking and tier system to the database
-- Run this script to add the required columns

-- 1. Add isMemorized column to vocabulary table
ALTER TABLE vocabulary 
ADD COLUMN IF NOT EXISTS is_memorized BOOLEAN DEFAULT false;

-- 2. Add tier and memorizedCount columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'Apprentice';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS memorized_count INTEGER DEFAULT 0;

-- 3. Create function to update tier based on memorized count
CREATE OR REPLACE FUNCTION update_user_tier(p_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    new_tier TEXT;
BEGIN
    -- Get current memorized count for the user
    SELECT COUNT(*) INTO current_count
    FROM vocabulary
    WHERE user_id = p_user_id AND is_memorized = true;
    
    -- Determine tier based on count
    IF current_count >= 1000 THEN
        new_tier := 'Sage';
    ELSIF current_count >= 500 THEN
        new_tier := 'Knight';
    ELSE
        new_tier := 'Apprentice';
    END IF;
    
    -- Update profile with new count and tier
    UPDATE profiles 
    SET memorized_count = current_count,
        tier = new_tier,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Create profile if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO profiles (user_id, memorized_count, tier, created_at, updated_at)
        VALUES (p_user_id, current_count, new_tier, NOW(), NOW());
    END IF;
    
    RETURN new_tier;
END;
$$;

-- 4. Create function to mark word as memorized
CREATE OR REPLACE FUNCTION mark_word_memorized(p_user_id TEXT, p_word_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    word_exists BOOLEAN;
BEGIN
    -- Check if word exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM vocabulary 
        WHERE id = p_word_id AND user_id = p_user_id
    ) INTO word_exists;
    
    IF NOT word_exists THEN
        RETURN false;
    END IF;
    
    -- Mark word as memorized
    UPDATE vocabulary 
    SET is_memorized = true,
        updated_at = NOW()
    WHERE id = p_word_id AND user_id = p_user_id;
    
    -- Update user's tier
    PERFORM update_user_tier(p_user_id);
    
    RETURN true;
END;
$$;

-- 5. Create function to get user's tier information
CREATE OR REPLACE FUNCTION get_user_tier_info(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_count INTEGER;
    current_tier TEXT;
    next_tier TEXT;
    next_tier_requirement INTEGER;
    progress_percentage NUMERIC;
BEGIN
    -- Get current memorized count
    SELECT COUNT(*) INTO current_count
    FROM vocabulary
    WHERE user_id = p_user_id AND is_memorized = true;
    
    -- Determine current tier
    IF current_count >= 1000 THEN
        current_tier := 'Sage';
        next_tier := 'Max';
        next_tier_requirement := 1000;
        progress_percentage := 100;
    ELSIF current_count >= 500 THEN
        current_tier := 'Knight';
        next_tier := 'Sage';
        next_tier_requirement := 1000;
        progress_percentage := ROUND(((current_count - 500) * 100.0) / 500, 1);
    ELSE
        current_tier := 'Apprentice';
        next_tier := 'Knight';
        next_tier_requirement := 500;
        progress_percentage := ROUND((current_count * 100.0) / 500, 1);
    END IF;
    
    -- Update profile
    PERFORM update_user_tier(p_user_id);
    
    -- Build result JSON
    result := json_build_object(
        'currentTier', current_tier,
        'memorizedCount', current_count,
        'nextTier', next_tier,
        'nextTierRequirement', next_tier_requirement,
        'progressPercentage', progress_percentage
    );
    
    RETURN result;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION update_user_tier(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_word_memorized(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tier_info(TEXT) TO authenticated;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_memorized 
ON vocabulary(user_id, is_memorized);

CREATE INDEX IF NOT EXISTS idx_profiles_user_tier 
ON profiles(user_id, tier);

-- 8. Update existing profiles to have correct tier (run once)
-- This will calculate the tier for existing users based on their vocabulary
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT user_id FROM vocabulary 
    LOOP
        PERFORM update_user_tier(user_record.user_id);
    END LOOP;
END;
$$;