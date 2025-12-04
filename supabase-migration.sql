-- ============================================
-- Add Shipping Columns to item_requests
-- Run this AFTER the main schema
-- ============================================

-- Add condition column to donation_items if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_items' AND column_name = 'condition') THEN
    ALTER TABLE donation_items ADD COLUMN condition TEXT DEFAULT 'Good';
  END IF;
END $$;

-- Add shipping columns to item_requests
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_name') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_phone') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_address') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_city') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_state') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_state TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_zip') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_zip TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_requests' AND column_name = 'shipping_country') THEN
    ALTER TABLE item_requests ADD COLUMN shipping_country TEXT DEFAULT 'Sri Lanka';
  END IF;
END $$;

-- Add phone and address columns to user_profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE user_profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'address') THEN
    ALTER TABLE user_profiles ADD COLUMN address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
    ALTER TABLE user_profiles ADD COLUMN city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'state') THEN
    ALTER TABLE user_profiles ADD COLUMN state TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'zip_code') THEN
    ALTER TABLE user_profiles ADD COLUMN zip_code TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'country') THEN
    ALTER TABLE user_profiles ADD COLUMN country TEXT DEFAULT 'Sri Lanka';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Update user_profiles policy to allow insert
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to insert donation_items (for donate page)
DROP POLICY IF EXISTS "Users can insert donation items" ON donation_items;
CREATE POLICY "Users can insert donation items"
  ON donation_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

SELECT 'Migration completed successfully!' as status;
