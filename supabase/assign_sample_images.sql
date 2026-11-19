-- Bulk Assign Images to Dishes
-- First, get the list of images you uploaded:

SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'menu-images' 
ORDER BY created_at DESC;

-- Copy one of the image names (e.g., 'library/abc-123.webp')
-- Then assign it to dishes:

-- Example: Assign an image to a specific dish
UPDATE menu_items 
SET image_url = 'menu-images/library/YOUR-IMAGE-NAME.webp'
WHERE name_en = 'Breakfast Package';

-- Example: Assign same image to all breakfast items
UPDATE menu_items 
SET image_url = 'menu-images/library/YOUR-IMAGE-NAME.webp'
WHERE category_id = (SELECT id FROM categories WHERE name_en = 'Breakfast' LIMIT 1)
AND image_url IS NULL;

-- Example: Assign a default image to all items without images
UPDATE menu_items 
SET image_url = 'menu-images/library/YOUR-DEFAULT-IMAGE.webp'
WHERE image_url IS NULL;

-- Verify changes
SELECT id, name_en, image_url 
FROM menu_items 
WHERE image_url IS NOT NULL 
LIMIT 20;
