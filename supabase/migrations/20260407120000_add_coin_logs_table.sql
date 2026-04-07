-- Add coin_logs table to database schema
-- This table tracks coin transactions for users

CREATE TABLE IF NOT EXISTS coin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earning, negative for spending
  source TEXT NOT NULL, -- Source of coin transaction (e.g., 'lesson_complete', 'shop_purchase')
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL, -- Optional lesson reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb -- Additional transaction data
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coin_logs_user_id ON coin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_logs_created_at ON coin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_logs_source ON coin_logs(source);

-- Add RLS policies
ALTER TABLE coin_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own coin logs
CREATE POLICY "Users can view own coin logs" ON coin_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own coin logs
CREATE POLICY "Users can insert own coin logs" ON coin_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No direct updates or deletes allowed through API (handled by functions)

-- Add coins column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON TABLE coin_logs IS 'Tracks all coin transactions for users';
COMMENT ON COLUMN coin_logs.amount IS 'Coin amount (positive = earned, negative = spent)';
COMMENT ON COLUMN coin_logs.source IS 'Source of the coin transaction';
COMMENT ON COLUMN coin_logs.metadata IS 'Additional transaction data in JSON format';
