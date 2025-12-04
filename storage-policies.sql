-- Supabase Storage Setup for Product Images and Payment Receipts
-- Run these commands in your Supabase SQL Editor

-- 1. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for product images (using DO blocks to handle existing policies)

-- Allow anyone to view/download images (public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects 
      FOR INSERT TO authenticated 
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own images'
  ) THEN
    CREATE POLICY "Users can delete own images" ON storage.objects 
      FOR DELETE TO authenticated 
      USING (
        bucket_id = 'product-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow users to update their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own images'
  ) THEN
    CREATE POLICY "Users can update own images" ON storage.objects 
      FOR UPDATE TO authenticated 
      USING (
        bucket_id = 'product-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- For user-specific folder organization:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload to own folder'
  ) THEN
    CREATE POLICY "Users can upload to own folder" ON storage.objects 
      FOR INSERT TO authenticated 
      WITH CHECK (
        bucket_id = 'product-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- 3. Create storage bucket for payment receipts (public bucket for easier access)
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

-- 4. Set up storage policies for payment receipts
-- Drop all existing payment receipt policies to avoid conflicts
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

-- Allow users to upload their own payment receipts
-- Folder structure: payment_receipts/{user_id}/{transaction_id}.{ext}
CREATE POLICY "Users can upload payment receipts" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'payment-receipts' 
    AND (storage.foldername(name))[1] = 'payment_receipts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to view/download their own payment receipts
CREATE POLICY "Users can view own payment receipts" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (
    bucket_id = 'payment-receipts' 
    AND (storage.foldername(name))[1] = 'payment_receipts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to update their own payment receipts
CREATE POLICY "Users can update own payment receipts" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (
    bucket_id = 'payment-receipts' 
    AND (storage.foldername(name))[1] = 'payment_receipts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own payment receipts
CREATE POLICY "Users can delete own payment receipts" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (
    bucket_id = 'payment-receipts' 
    AND (storage.foldername(name))[1] = 'payment_receipts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Ensure the admin function exists
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

-- Allow admins to view all payment receipts (for verification)
CREATE POLICY "Admins can view all payment receipts" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (
    bucket_id = 'payment-receipts' AND is_admin()
  );

-- Allow admins to delete payment receipts if needed
CREATE POLICY "Admins can delete payment receipts" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (    bucket_id = 'payment-receipts' AND is_admin()
  );

-- File naming pattern for payment receipts:
-- payment_receipts/{user_id}/{transaction_id}.{ext}
-- Example: payment_receipts/973c409d-7c52-4c67-81cd-ade9665f8c9c/txn_12345.jpg

-- Verification queries
SELECT 
  'Storage bucket check' as test_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-receipts') 
    THEN 'BUCKET EXISTS' 
    ELSE 'BUCKET MISSING' 
  END as result;

SELECT 
  'Storage policies check' as test_name,
  COUNT(*) as policy_count,
  'Number of payment receipt policies created' as description
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname ILIKE '%payment%receipt%';

SELECT 'STORAGE SETUP COMPLETE' as status;
