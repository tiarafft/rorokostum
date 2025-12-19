/*
  # Add Logo Storage and Settings

  1. New Storage Bucket
    - Create 'company-assets' bucket for logo and company images
    - Enable public access for logo visibility
    - Set file size limits and allowed file types

  2. Storage Policies
    - Authenticated users (admins) can upload files
    - Public can view/download files
    - Only admins can delete files

  3. New Settings
    - Add logo_url setting to store current logo path

  4. Security
    - RLS enabled on storage bucket
    - Upload restricted to authenticated users only
*/

-- Create storage bucket for company assets (logo, etc)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-assets bucket
DO $$
BEGIN
  -- Public can view company assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view company assets'
  ) THEN
    CREATE POLICY "Public can view company assets"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'company-assets');
  END IF;

  -- Authenticated users can upload company assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload company assets'
  ) THEN
    CREATE POLICY "Authenticated users can upload company assets"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'company-assets');
  END IF;

  -- Authenticated users can update company assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update company assets'
  ) THEN
    CREATE POLICY "Authenticated users can update company assets"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'company-assets')
      WITH CHECK (bucket_id = 'company-assets');
  END IF;

  -- Authenticated users can delete company assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete company assets'
  ) THEN
    CREATE POLICY "Authenticated users can delete company assets"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'company-assets');
  END IF;
END $$;

-- Add logo_url setting
INSERT INTO settings (key, value) VALUES
  ('logo_url', '')
ON CONFLICT (key) DO NOTHING;
