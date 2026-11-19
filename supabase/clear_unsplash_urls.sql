-- Clear Broken Unsplash URLs
-- This will remove all Unsplash image URLs so dishes show placeholders
-- Then you can assign your uploaded images from the admin console

-- Step 1: Backup current image URLs (optional, for reference)
-- SELECT id, name_en, image_url FROM menu_items WHERE image_url LIKE '%unsplash%';

-- Step 2: Clear all Unsplash URLs
UPDATE menu_items 
SET image_url = NULL 
WHERE image_url LIKE '%unsplash%';

-- Step 3: Verify (should show dishes without images)
SELECT id, name_en, image_url 
FROM menu_items 
WHERE image_url IS NULL 
LIMIT 20;

-- Now go to admin console and assign your uploaded images to each dish!
