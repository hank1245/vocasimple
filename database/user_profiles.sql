-- User Profiles Table
-- This table stores additional user information including nicknames

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname VARCHAR(21), -- Up to 20 characters + # prefix
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one profile per user
CREATE UNIQUE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

-- Create index for nickname searches (optional, for uniqueness checks)
CREATE INDEX user_profiles_nickname_idx ON user_profiles(nickname);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can only delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Example usage:
-- INSERT INTO user_profiles (user_id, nickname) VALUES ('user-uuid', '#cutehorangi');
-- UPDATE user_profiles SET nickname = '#newname' WHERE user_id = 'user-uuid';