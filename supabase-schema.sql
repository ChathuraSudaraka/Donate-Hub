-- Supabase SQL Schema for Donate-Hub
-- Run this in your Supabase SQL Editor

-- Drop existing policies and tables if they exist (for clean reinstall)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view available donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can view all donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can insert donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can update donation items" ON donation_items;
DROP POLICY IF EXISTS "Admins can delete donation items" ON donation_items;
DROP POLICY IF EXISTS "Users can view their own requests" ON item_requests;
DROP POLICY IF EXISTS "Users can create requests" ON item_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON item_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON item_requests;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_donation_items_updated_at ON donation_items;
DROP TRIGGER IF EXISTS update_item_requests_updated_at ON item_requests;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS item_requests;
DROP TABLE IF EXISTS donation_items;
DROP TABLE IF EXISTS user_profiles;

DROP TYPE IF EXISTS item_category;
DROP TYPE IF EXISTS request_status;
DROP TYPE IF EXISTS user_role;

-- Create custom types
CREATE TYPE item_category AS ENUM ('book', 'pencil', 'school_supplies');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donation Items Table (items available for donation)
CREATE TABLE donation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category item_category NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Requests Table (user requests for items)
CREATE TABLE item_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category item_category NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_donation_items_updated_at
  BEFORE UPDATE ON donation_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_requests_updated_at
  BEFORE UPDATE ON item_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FIXED RLS POLICIES (avoiding recursion)
-- ============================================

-- Helper function to check if user is admin (uses SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Donation Items Policies (public read for available, admin full access)
CREATE POLICY "Anyone can view available donation items"
  ON donation_items FOR SELECT
  USING (is_available = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert donation items"
  ON donation_items FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

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

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample donation items
INSERT INTO donation_items (name, description, category, quantity, is_available) VALUES
  ('Mathematics Textbook', 'Grade 10 Mathematics textbook in good condition', 'book', 5, true),
  ('Science Encyclopedia', 'Comprehensive science reference book for students', 'book', 3, true),
  ('Pencil Set (12 pack)', 'HB pencils suitable for school use', 'pencil', 20, true),
  ('Colored Pencils (24 pack)', 'Vibrant colored pencils for art class', 'pencil', 15, true),
  ('School Backpack', 'Durable backpack with multiple compartments', 'school_supplies', 10, true),
  ('Notebook Bundle (5 notebooks)', 'Lined notebooks for school notes', 'school_supplies', 25, true),
  ('Geometry Set', 'Complete geometry set with compass, protractor, and ruler', 'school_supplies', 8, true);
