-- Alternative approach: Create a function that can safely create user profiles
-- This function will run with elevated privileges to bypass RLS issues

CREATE OR REPLACE FUNCTION create_user_profile(p_user_id UUID, p_nickname TEXT DEFAULT NULL)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
    result user_profiles;
    default_nickname TEXT;
BEGIN
    -- Generate default nickname if not provided
    IF p_nickname IS NULL THEN
        default_nickname := '#' || SUBSTRING(p_user_id::text, 1, 8);
    ELSE
        default_nickname := p_nickname;
    END IF;

    -- Insert the new profile
    INSERT INTO user_profiles (user_id, nickname, created_at, updated_at)
    VALUES (p_user_id, default_nickname, NOW(), NOW())
    RETURNING * INTO result;
    
    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- If profile already exists, return existing profile
        SELECT * INTO result FROM user_profiles WHERE user_id = p_user_id;
        RETURN result;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT) TO authenticated;

-- Usage example:
-- SELECT * FROM create_user_profile('user-uuid', 'customnickname');
-- SELECT * FROM create_user_profile('user-uuid'); -- Uses default nickname