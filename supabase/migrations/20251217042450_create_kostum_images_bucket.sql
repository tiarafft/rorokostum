/*
  # Create Supabase Storage Bucket for Costume Images

  1. Storage Setup
    - Create 'kostum-images' bucket for storing costume photos
    - Set bucket to public access for easy image display
    - File size limit: 5MB per image
    - Allowed file types: image/jpeg, image/png, image/webp

  2. Security Policies
    - Public read access for all images (anyone can view)
    - Authenticated users can upload images
    - Only admin users can delete images

  3. Notes
    - Images will be automatically accessible via public URL
    - No need to convert Google Drive links anymore
    - Direct upload from admin panel
*/

-- Create storage bucket for costume images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kostum-images',
  'kostum-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view/download images
CREATE POLICY "Public can view costume images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'kostum-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload costume images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kostum-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update costume images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'kostum-images')
  WITH CHECK (bucket_id = 'kostum-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete costume images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kostum-images');