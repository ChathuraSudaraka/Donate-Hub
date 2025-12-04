-- ============================================
-- User Addresses Table Migration
-- Run this AFTER the main schema
-- ============================================

-- Create User Addresses Table (for multiple addresses)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home', -- e.g., Home, Work, School
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Sri Lanka',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_addresses
CREATE POLICY "Users can view their own addresses"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_primary ON user_addresses(user_id, is_primary);

-- ============================================
-- Function to ensure only one primary address
-- ============================================
CREATE OR REPLACE FUNCTION public.ensure_single_primary_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If this address is being set as primary
  IF NEW.is_primary = true THEN
    -- Set all other addresses for this user to not primary
    UPDATE user_addresses 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_address();
