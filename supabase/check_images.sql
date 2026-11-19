-- 📸 Image Status Check - Bulcha Digital Menu
-- Run this to see which dishes have/don't have images

-- Summary: Images by category
SELECT 
    c.name_en as category,
    COUNT(*) as total_items,
    COUNT(m.image_url) as with_images,
    COUNT(*) - COUNT(m.image_url) as missing_images,
    ROUND(COUNT(m.image_url)::numeric / COUNT(*)::numeric * 100, 1) as percent_complete
FROM menu_items m
LEFT JOIN categories c ON m.category_id = c.id
GROUP BY c.name_en
ORDER BY c.sort_order;

-- Detailed: Dishes without images
SELECT 
    c.name_en as category,
    m.name_en as dish_name,
    m.price,
    m.is_available,
    m.is_featured
FROM menu_items m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.image_url IS NULL
ORDER BY c.sort_order, m.sort_order;

-- Image URL formats (check for broken URLs)
SELECT 
    CASE 
        WHEN image_url IS NULL THEN 'No image'
        WHEN image_url LIKE 'http%' THEN 'External URL'
        WHEN image_url LIKE 'menu-images/library/%' THEN 'Storage (correct)'
        WHEN image_url LIKE 'menu-images/%' THEN 'Storage (root)'
        ELSE 'Unknown format'
    END as image_type,
    COUNT(*) as count
FROM menu_items
GROUP BY image_type
ORDER BY count DESC;

-- Most expensive dishes without images (priority to add)
SELECT 
    name_en,
    price,
    is_featured,
    category_id
FROM menu_items
WHERE image_url IS NULL
AND is_available = true
ORDER BY price DESC
LIMIT 10;

-- Recently updated items (check if images were added)
SELECT 
    name_en,
    CASE 
        WHEN image_url IS NOT NULL THEN '✅ Has image'
        ELSE '❌ Missing'
    END as image_status,
    updated_at
FROM menu_items
ORDER BY updated_at DESC
LIMIT 20;

-- Storage bucket file count
SELECT 
    COUNT(*) as total_files,
    COUNT(DISTINCT name) as unique_files,
    ROUND(SUM((metadata->>'size')::numeric) / 1024 / 1024, 2) as total_size_mb
FROM storage.objects
WHERE bucket_id = 'menu-images';

-- Most popular dishes (should have images!)
SELECT 
    m.name_en,
    m.is_featured,
    CASE 
        WHEN m.image_url IS NOT NULL THEN '✅'
        ELSE '❌ NEEDS IMAGE'
    END as has_image,
    m.price
FROM menu_items m
WHERE m.is_featured = true OR m.is_available = true
ORDER BY m.is_featured DESC, m.price DESC
LIMIT 20;
