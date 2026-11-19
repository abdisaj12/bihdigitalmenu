-- Fix Storage Bucket Public Access
-- Run this in Supabase SQL Editor if images aren't displaying

-- 1. Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'menu-images';

-- 2. Verify bucket settings
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'menu-images';

-- 3. Check if any images exist
SELECT name, metadata 
FROM storage.objects 
WHERE bucket_id = 'menu-images' 
LIMIT 10;

-- 4. Verify RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%menu%';

-- If the above shows no policies, run the policies from:
-- supabase/migrations/0007_create_storage_buckets.sql
