-- Create storage bucket for KTP images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ktp-images', 'ktp-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload KTP images
CREATE POLICY "Authenticated users can upload KTP images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ktp-images');

-- Allow authenticated users to view KTP images
CREATE POLICY "Authenticated users can view KTP images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ktp-images');

-- Allow authenticated users to update their KTP images
CREATE POLICY "Authenticated users can update KTP images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ktp-images');

-- Allow authenticated users to delete KTP images
CREATE POLICY "Authenticated users can delete KTP images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ktp-images');

-- Add ktp_image_url column to loans table
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS ktp_image_url TEXT;