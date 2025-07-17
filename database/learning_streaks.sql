-- Learning Streaks Table
-- This table stores user learning completion dates for streak tracking

CREATE TABLE learning_streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_dates TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one record per user
CREATE UNIQUE INDEX learning_streaks_user_id_idx ON learning_streaks(user_id);

-- Create index for efficient querying
CREATE INDEX learning_streaks_completion_dates_idx ON learning_streaks USING GIN(completion_dates);

-- Row Level Security (RLS) policies
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own learning streaks
CREATE POLICY "Users can read own learning streaks" ON learning_streaks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own learning streaks
CREATE POLICY "Users can insert own learning streaks" ON learning_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own learning streaks
CREATE POLICY "Users can update own learning streaks" ON learning_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own learning streaks
CREATE POLICY "Users can delete own learning streaks" ON learning_streaks
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_learning_streaks_updated_at
    BEFORE UPDATE ON learning_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Example usage:
-- INSERT INTO learning_streaks (user_id, completion_dates) VALUES ('user-uuid', '{"2025-01-15", "2025-01-16"}');
-- UPDATE learning_streaks SET completion_dates = array_append(completion_dates, '2025-01-17') WHERE user_id = 'user-uuid';