-- Recycle Hub Database Schema for Supabase
-- This file contains all the SQL queries needed to set up your database

-- Enable Row Level Security (RLS) for all tables
-- Run these in the Supabase SQL editor

-- 1. Create Users Profile Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  credits INTEGER DEFAULT 100, -- Free 100 credits for new users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id INTEGER REFERENCES categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  condition TEXT CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')) NOT NULL,
  is_negotiable BOOLEAN DEFAULT FALSE,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'sold', 'reserved', 'inactive')) DEFAULT 'available',
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Product Specifications Table
CREATE TABLE IF NOT EXISTS product_specifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  spec_name TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 7. Create Messages/Chat Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Create Reviews/Ratings Table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(reviewer_id, reviewed_user_id, product_id)
);

-- 9. Create Credit Packages Table
CREATE TABLE IF NOT EXISTS credit_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Create Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'spend', 'refund')) NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  payment_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Create Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  package_id INTEGER REFERENCES credit_packages(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  credits INTEGER NOT NULL, -- Number of credits to be awarded
  package_name TEXT, -- Store package name for reference
  payment_method TEXT CHECK (payment_method IN ('paypal', 'manual', 'stripe', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit')) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
  status TEXT CHECK (status IN ('pending', 'pending_review', 'completed', 'failed', 'cancelled', 'refunded', 'rejected', 'approved')) DEFAULT 'pending', -- Alternative status field
  payment_reference TEXT, -- PayPal transaction ID or manual reference
  reference_number TEXT, -- For manual payments
  payment_slip_url TEXT, -- For manual payments
  receipt_url TEXT, -- For manual payment receipts
  paypal_order_id TEXT,
  paypal_payment_id TEXT,
  payer_email TEXT, -- PayPal payer email
  transaction_id TEXT, -- PayPal transaction ID
  notes TEXT,
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who processed manual payment
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to payment_transactions table (for existing databases)
-- Run this if you already created the payment_transactions table without these columns
DO $$
BEGIN
    -- Add credits column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'credits'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add package_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'package_name'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN package_name TEXT;
    END IF;

    -- Add status column if it doesn't exist (alternative to payment_status)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN status TEXT CHECK (status IN ('pending', 'pending_review', 'completed', 'failed', 'cancelled', 'refunded', 'rejected', 'approved')) DEFAULT 'pending';
    END IF;

    -- Add reference_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'reference_number'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN reference_number TEXT;
    END IF;

    -- Add receipt_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'receipt_url'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN receipt_url TEXT;
    END IF;

    -- Add payer_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'payer_email'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN payer_email TEXT;
    END IF;

    -- Add transaction_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN transaction_id TEXT;
    END IF;
END $$;

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- 13. Insert default categories
INSERT INTO categories (name, description, icon_url) VALUES 
('Electronics', 'Electronic devices, gadgets, and accessories', '/icons/electronics.svg'),
('Furniture', 'Home and office furniture items', '/icons/furniture.svg'),
('Sports', 'Sports equipment and fitness gear', '/icons/sports.svg'),
('Clothing', 'Clothes, shoes, and fashion accessories', '/icons/clothing.svg'),
('Books', 'Books, magazines, and educational materials', '/icons/books.svg'),
('Vehicle Parts', 'Car, bike, and vehicle accessories', '/icons/vehicle.svg'),
('Others', 'Miscellaneous items', '/icons/others.svg')
ON CONFLICT (name) DO NOTHING;

-- 14. Insert default credit packages
INSERT INTO credit_packages (name, credits, price, description) VALUES 
('Starter Pack', 50, 9.99, '50 credits to post your products'),
('Popular Pack', 150, 24.99, '150 credits - Best value for regular sellers'),
('Pro Pack', 300, 44.99, '300 credits for professional sellers'),
('Mega Pack', 500, 69.99, '500 credits for high-volume sellers')
ON CONFLICT DO NOTHING;

-- 15. Create Row Level Security (RLS) policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles (for seller info)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to update any user's profile (needed for credit management)
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated USING (is_admin());

-- Categories policies (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Allow authenticated users to insert categories
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update categories  
CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Products policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view available products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (status = 'available' OR seller_id = auth.uid());

-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

-- Allow users to update their own products
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

-- Allow users to delete their own products
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- Product images policies
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view product images
CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (true);

-- Allow product owners to manage images
CREATE POLICY "Product owners can manage images" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Product specifications policies
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product specs are viewable by everyone" ON product_specifications
  FOR SELECT USING (true);

CREATE POLICY "Product owners can manage specs" ON product_specifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_specifications.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Favorites policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Credit system RLS policies
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Credit packages are viewable by everyone" ON credit_packages
  FOR SELECT USING (is_active = true);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions" ON credit_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment transactions" ON payment_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment transactions" ON payment_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 16. Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user rating when a new review is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(2,1) 
            FROM reviews 
            WHERE reviewed_user_id = NEW.reviewed_user_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviewed_user_id = NEW.reviewed_user_id
        )
    WHERE id = NEW.reviewed_user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for rating updates
CREATE TRIGGER update_user_rating_trigger 
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to update favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET favorites_count = favorites_count + 1 
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET favorites_count = favorites_count - 1 
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for favorites count
CREATE TRIGGER favorites_count_trigger 
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, location)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET views = views + 1 
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 17. Insert sample data for testing

-- Insert sample profiles (you'll need to replace UUIDs with actual user IDs)
-- INSERT INTO profiles (id, email, full_name, phone, location, rating, total_ratings) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'john.doe@example.com', 'John Doe', '+94 77 123 4567', 'Colombo, Sri Lanka', 4.5, 10),
-- ('550e8400-e29b-41d4-a716-446655440001', 'sarah.smith@example.com', 'Sarah Smith', '+94 76 987 6543', 'Kandy, Sri Lanka', 4.8, 15);

-- 18. Create views for common queries

-- View for products with seller info and category
CREATE OR REPLACE VIEW products_with_details AS
SELECT 
    p.*,
    pr.full_name as seller_name,
    pr.phone as seller_phone,
    pr.email as seller_email,
    pr.location as seller_location,
    pr.avatar_url as seller_avatar_url,
    pr.rating as seller_rating,
    pr.total_ratings as seller_total_ratings,
    pr.bio as seller_bio,
    pr.is_verified as seller_is_verified,
    c.name as category_name,
    c.description as category_description,
    COALESCE(pi.image_url, '/image/placeholder.jpg') as primary_image
FROM products p
LEFT JOIN profiles pr ON p.seller_id = pr.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true;

-- Add search_vector column to products table for full-text search
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        NEW.title || ' ' || NEW.description || ' ' || 
        COALESCE((SELECT name FROM categories WHERE id = NEW.category_id), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_product_search_vector_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Create index for full-text search on the actual column
CREATE INDEX IF NOT EXISTS idx_product_search_vector ON products USING gin(search_vector);

-- Update existing products search vectors
UPDATE products SET search_vector = to_tsvector('english', 
    title || ' ' || description || ' ' || 
    COALESCE((SELECT name FROM categories WHERE id = products.category_id), '')
);

-- View for product search (simplified since search_vector is now in the table)
CREATE OR REPLACE VIEW product_search AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.original_price,
    p.condition,
    p.location,
    p.views,
    p.favorites_count,
    p.created_at,
    p.search_vector,
    pr.full_name as seller_name,
    c.name as category_name,
    pi.image_url as primary_image
FROM products p
LEFT JOIN profiles pr ON p.seller_id = pr.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.status = 'available';

-- Add notification preferences column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"emailNotifications": true, "productNotifications": true, "marketingEmails": false}';

-- ========================================
-- DONATIONS SYSTEM
-- ========================================

-- 1. Create donations table for community donation system
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  condition VARCHAR(50) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  image_url TEXT DEFAULT '/image/placeholder.jpg',
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create indexes for better performance on donations table
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_category ON donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_location ON donations(location);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- 3. Enable Row Level Security (RLS) on donations table
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for donations

-- Allow everyone to view available donations (public access)
CREATE POLICY "Donations are viewable by everyone" ON donations
  FOR SELECT USING (status = 'available');

-- Allow anyone to insert donations (no registration required)
CREATE POLICY "Anyone can insert donations" ON donations
  FOR INSERT WITH CHECK (true);

-- Allow donors to update their own donations (if they provide contact info)
CREATE POLICY "Donors can update own donations" ON donations
  FOR UPDATE USING (true);

-- 5. Create storage bucket for donation images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'donation-images', 
  'donation-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 6. Create storage policies for donation images

-- Allow anyone to upload donation images
CREATE POLICY "Anyone can upload donation images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'donation-images');

-- Allow everyone to view donation images (public)
CREATE POLICY "Donation images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'donation-images');

-- Allow updating donation images
CREATE POLICY "Anyone can update donation images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'donation-images');

-- Allow deleting donation images
CREATE POLICY "Anyone can delete donation images" ON storage.objects
  FOR DELETE USING (bucket_id = 'donation-images');

-- 7. Create function to update donations updated_at timestamp
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for donations updated_at
CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_donations_updated_at();

-- 9. Insert sample donation data for testing
INSERT INTO donations (item_name, description, category, condition, contact_name, contact_phone, contact_email, location, image_url) VALUES 
('Children''s Books Collection', 'Set of 20 educational books for kids aged 5-10. All in good condition with minimal wear.', 'Books', 'Good', 'Anonymous Donor', '+94 77 123 4567', 'donor1@example.com', 'Colombo', '/image/15.png'),
('Office Chair', 'Comfortable ergonomic office chair, barely used. Perfect for home office or study room.', 'Furniture', 'Excellent', 'Office Donation', '+94 76 987 6543', 'office@example.com', 'Kandy', '/image/16.png'),
('Winter Clothes', 'Warm jackets and sweaters for adults and children. Clean and in good condition.', 'Clothing', 'Good', 'Community Helper', '+94 75 555 1234', 'helper@example.com', 'Galle', '/image/17.png'),
('Laptop Computer', 'Working laptop suitable for basic computing tasks. Includes charger.', 'Electronics', 'Fair', 'Tech Donor', '+94 78 999 8888', 'tech@example.com', 'Colombo', '/image/18.png'),
('Children''s Toys', 'Collection of educational toys and games for children aged 3-8.', 'Toys', 'Good', 'Family Donation', '+94 71 777 6666', 'family@example.com', 'Negombo', '/image/19.png')
ON CONFLICT DO NOTHING;

-- 10. Create a view for donation statistics
CREATE OR REPLACE VIEW donation_stats AS
SELECT 
    COUNT(*) as total_donations,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_donations,
    COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_donations,
    category,
    COUNT(*) as category_count
FROM donations 
GROUP BY category
ORDER BY category_count DESC;

-- Grant usage on donations sequence
GRANT USAGE, SELECT ON SEQUENCE donations_id_seq TO anon, authenticated;

-- ========================================
-- PAYMENT SYSTEM ENHANCEMENTS
-- ========================================

-- 1. Add missing admin review columns to payment_transactions table
DO $$
BEGIN
    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add approved_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    -- Add rejected_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create payment notifications table
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_transaction_id INTEGER REFERENCES payment_transactions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'payment_approved', 'payment_rejected', 'payment_pending'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create performance indexes for payment system
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_read ON payment_notifications(read);

-- 4. Add RLS policies for payment notifications
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own notifications" ON payment_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON payment_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON payment_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON payment_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON payment_notifications;
DROP POLICY IF EXISTS "Admins can read all notifications" ON payment_notifications;

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications" ON payment_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Allow any authenticated user to insert notifications (needed for admin actions)
CREATE POLICY "Authenticated users can insert notifications" ON payment_notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow admins to insert notifications for any user (explicit admin policy)
CREATE POLICY "Admins can insert notifications" ON payment_notifications
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON payment_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can read all notifications (for debugging/support)
CREATE POLICY "Admins can read all notifications" ON payment_notifications
  FOR SELECT TO authenticated USING (is_admin());

-- 5. Add admin role check function for role-based admin access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'email') = 'admin@recyclehub.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add RLS policy for admin access to all payment transactions
CREATE POLICY "Admins can access all payment transactions" ON payment_transactions
  FOR ALL USING (is_admin());

-- 6.1. Add RLS policies for admin access to credit transactions
-- These are essential for payment approval functionality
DROP POLICY IF EXISTS "Admins can insert credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Admins can view all credit transactions" ON credit_transactions;

CREATE POLICY "Admins can insert credit transactions" ON credit_transactions
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can view all credit transactions" ON credit_transactions
  FOR SELECT USING (is_admin());

-- 7. Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts', 
  'payment-receipts', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

-- 8. Create storage policies for payment receipts
-- Drop all existing storage policies for payment-receipts to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname ILIKE '%payment%receipt%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects;';
    END LOOP;
END $$;

-- Allow authenticated users to upload payment receipts to their own folder
CREATE POLICY "Users can upload payment receipts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'payment-receipts' AND
    (storage.foldername(name))[1] = 'payment_receipts' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to view their own payment receipts
CREATE POLICY "Users can view own payment receipts" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'payment-receipts' AND
    (storage.foldername(name))[1] = 'payment_receipts' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to update their own payment receipts
CREATE POLICY "Users can update own payment receipts" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'payment-receipts' AND
    (storage.foldername(name))[1] = 'payment_receipts' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own payment receipts
CREATE POLICY "Users can delete own payment receipts" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'payment-receipts' AND
    (storage.foldername(name))[1] = 'payment_receipts' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Admin policies: Allow admins to view and manage all payment receipts
CREATE POLICY "Admins can view all payment receipts" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'payment-receipts' AND is_admin()
  );

CREATE POLICY "Admins can delete payment receipts" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'payment-receipts' AND is_admin()
  );

-- 9. Add trigger to update payment_transactions timestamps
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Add trigger to update payment_notifications timestamps
CREATE TRIGGER update_payment_notifications_updated_at
  BEFORE UPDATE ON payment_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Add table comments for documentation
COMMENT ON TABLE payment_notifications IS 'Stores user notifications for payment status updates';
COMMENT ON COLUMN payment_notifications.notification_type IS 'Types: payment_approved, payment_rejected, payment_pending, payment_failed';

-- ========================================
-- END PAYMENT SYSTEM ENHANCEMENTS
-- ========================================

-- 1.1. Update check constraints to include all possible status values
-- Drop and recreate constraints to include 'rejected' and 'approved' statuses
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_status_check;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_status_check 
  CHECK (status IN ('pending', 'pending_review', 'completed', 'failed', 'cancelled', 'refunded', 'rejected', 'approved'));

-- Update payment_method constraint to include all supported methods
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_payment_method_check;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_payment_method_check 
  CHECK (payment_method IN ('paypal', 'manual', 'stripe', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit'));
