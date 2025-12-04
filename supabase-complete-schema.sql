-- ============================================
-- COMPLETE Supabase SQL Schema for Donate-Hub
-- Run this ONCE in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: CLEAN UP (Drop existing objects)
-- ============================================

-- Drop policies first (they depend on functions)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Anyone can view available items" ON donation_items;
DROP POLICY IF EXISTS "Users can view own donations" ON donation_items;
DROP POLICY IF EXISTS "Admins can view all items" ON donation_items;
DROP POLICY IF EXISTS "Users can insert donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can update donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can delete donation items" ON donation_items;
DROP POLICY IF EXISTS "Users can view their own requests" ON item_requests;
DROP POLICY IF EXISTS "Users can create requests" ON item_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON item_requests;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_donation_items_updated_at ON donation_items;
DROP TRIGGER IF EXISTS update_item_requests_updated_at ON item_requests;
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
DROP TRIGGER IF EXISTS ensure_single_primary_address ON user_addresses;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.ensure_single_primary_address();

-- Drop tables (CASCADE removes remaining dependencies)
DROP TABLE IF EXISTS item_requests CASCADE;
DROP TABLE IF EXISTS donation_items CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS item_category CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- STEP 2: CREATE TYPES
-- ============================================

CREATE TYPE item_category AS ENUM ('book', 'pencil', 'school_supplies');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'user'::user_role,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Sri Lanka',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Addresses Table (multiple addresses per user)
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
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

-- Donation Items Table
CREATE TABLE donation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category item_category NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  condition TEXT DEFAULT 'Good',
  is_available BOOLEAN DEFAULT true,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Requests Table
CREATE TABLE item_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category item_category NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  status request_status DEFAULT 'pending'::request_status,
  admin_notes TEXT,
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'Sri Lanka',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: CREATE FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure only one primary address per user
CREATE OR REPLACE FUNCTION public.ensure_single_primary_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE user_addresses 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin check function (SECURITY DEFINER to bypass RLS)
-- NOTE: Created after tables exist to avoid "relation does not exist" error
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 5: CREATE TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_items_updated_at
  BEFORE UPDATE ON donation_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_item_requests_updated_at
  BEFORE UPDATE ON item_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Single primary address trigger
CREATE TRIGGER ensure_single_primary_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_address();

-- ============================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- User Addresses Policies
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

-- Donation Items Policies
CREATE POLICY "Anyone can view available items"
  ON donation_items FOR SELECT
  USING (is_available = true);

CREATE POLICY "Users can view own donations"
  ON donation_items FOR SELECT
  USING (donor_id = auth.uid());

CREATE POLICY "Admins can view all items"
  ON donation_items FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert donation items"
  ON donation_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update donation items"
  ON donation_items FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete donation items"
  ON donation_items FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Item Requests Policies
CREATE POLICY "Users can view their own requests"
  ON item_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create requests"
  ON item_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update requests"
  ON item_requests FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- STEP 8: CREATE INDEXES
-- ============================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_primary ON user_addresses(user_id, is_primary);
CREATE INDEX idx_donation_items_category ON donation_items(category);
CREATE INDEX idx_donation_items_available ON donation_items(is_available);
CREATE INDEX idx_donation_items_donor_id ON donation_items(donor_id);
CREATE INDEX idx_item_requests_user_id ON item_requests(user_id);
CREATE INDEX idx_item_requests_status ON item_requests(status);

-- ============================================
-- STEP 9: INSERT PROFILES FOR EXISTING USERS
-- ============================================

INSERT INTO public.user_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  CASE WHEN email = 'admin@donatehub.com' THEN 'admin'::user_role ELSE 'user'::user_role END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, user_profiles.name);

-- ============================================
-- STEP 10: INSERT SAMPLE DATA
-- ============================================

INSERT INTO donation_items (name, description, category, quantity, condition, is_available) VALUES
  ('Mathematics Textbook Grade 10', 'Comprehensive math textbook covering algebra, geometry, and trigonometry. Good condition with minimal highlighting.', 'book', 5, 'Good', true),
  ('Science Encyclopedia', 'Full-color science reference book for students. Covers biology, chemistry, physics, and earth science.', 'book', 3, 'Excellent', true),
  ('English Literature Anthology', 'Collection of classic literature pieces for high school students.', 'book', 4, 'Good', true),
  ('HB Pencil Set (12 pack)', 'Standard HB pencils suitable for writing and drawing. Pre-sharpened.', 'pencil', 20, 'New', true),
  ('Colored Pencils (24 pack)', 'Vibrant colored pencils perfect for art class and creative projects.', 'pencil', 15, 'New', true),
  ('Mechanical Pencils (5 pack)', 'Refillable mechanical pencils with 0.5mm lead.', 'pencil', 12, 'New', true),
  ('School Backpack - Blue', 'Durable backpack with padded straps and multiple compartments. Fits laptops up to 15 inches.', 'school_supplies', 8, 'Good', true),
  ('Notebook Bundle (5 notebooks)', 'College-ruled notebooks, 100 pages each. Assorted colors.', 'school_supplies', 25, 'New', true),
  ('Geometry Set', 'Complete geometry set including compass, protractor, ruler, and set squares.', 'school_supplies', 10, 'New', true),
  ('Art Supplies Kit', 'Starter art kit with sketchbook, pencils, erasers, and sharpener.', 'school_supplies', 6, 'New', true);

-- ============================================
-- DONE! Your database is now set up.
-- ============================================
-- To make a user admin, run:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
