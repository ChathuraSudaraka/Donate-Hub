-- ============================================
-- Add donor_id to donation_items
-- Run this to track who donated each item
-- ============================================

-- Add donor_id column to donation_items
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_items' AND column_name = 'donor_id') THEN
    ALTER TABLE donation_items ADD COLUMN donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups by donor
CREATE INDEX IF NOT EXISTS idx_donation_items_donor_id ON donation_items(donor_id);

-- Update RLS policy to allow users to view their own donations
DROP POLICY IF EXISTS "Users can view own donations" ON donation_items;
CREATE POLICY "Users can view own donations"
  ON donation_items FOR SELECT
  USING (
    is_available = true 
    OR donor_id = auth.uid() 
    OR public.is_admin(auth.uid())
  );

SELECT 'Migration completed: donor_id added to donation_items' as status;
