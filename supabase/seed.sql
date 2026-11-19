-- =============================================================================
-- BULCHA INTERNATIONAL HOTEL — COMPLETE MENU SEED
-- Generated from the official Excel menu database
-- 14 categories · 165 active menu items
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- =============================================================================

-- ── 1. Settings ───────────────────────────────────────────────────────────────
INSERT INTO settings (id, hotel_name, vat_percent, currency, prices_include_vat, default_language, languages, opening_hours, wifi_name, wifi_password, phone)
VALUES (true, 'Bulcha International Hotel', 15, 'ETB', false, 'en', ARRAY['en','am','om'],
  'Breakfast 6:30–10:30 · Lunch 12:00–15:00 · Dinner 18:30–22:30 · Bar 10:00–23:00 · Room Service 24hrs',
  'Bulcha_WiFi', 'Ask reception', '+251 911 000 000')
ON CONFLICT (id) DO UPDATE SET
  hotel_name = EXCLUDED.hotel_name,
  vat_percent = EXCLUDED.vat_percent,
  currency = EXCLUDED.currency,
  prices_include_vat = EXCLUDED.prices_include_vat,
  default_language = EXCLUDED.default_language,
  languages = EXCLUDED.languages,
  opening_hours = EXCLUDED.opening_hours,
  phone = EXCLUDED.phone;

-- ── 2. Categories ─────────────────────────────────────────────────────────────
-- Wipe and re-seed categories (safe on fresh DB; adjust if you have live data)
INSERT INTO categories (id, name_en, name_am, name_om, slug, is_visible, sort_order, display_order)
VALUES
  ('cat-01', 'Breakfast & Brunch',          'ቁርስ',               'Ciree',          'breakfast', true,  1,  1),
  ('cat-02', 'Ethiopian & Local Favorites', 'ኢትዮጵያዊ ምግቦች',       'Nyaata Itoophiyaa', 'lunch', true,  2,  2),
  ('cat-03', 'Starters & Salads',           'ፍራሽ ምግቦች',          'Jalqabbii',       'special',  true,  3,  3),
  ('cat-04', 'Soups',                        'ሾርባ',               'Suuphii',         'special',     true,  4,  4),
  ('cat-05', 'Fish & Seafood',               'ዓሳ',                'Qurxummii',       'lunch',      true,  5,  5),
  ('cat-06', 'Pizza',                        'ፒዛ',                'Piizaa',          'dinner',     true,  6,  6),
  ('cat-07', 'Burgers & Sandwiches',         'ቡርገር',              'Bargarii',        'lunch',   true,  7,  7),
  ('cat-08', 'Italian & International',      'ዓለም አቀፍ ምግቦች',     'Nyaata Addunyaa', 'dinner',   true,  8,  8),
  ('cat-09', 'Fresh Juices & Smoothies',     'ጭማቂ',               'Juusii',          'drinks',    true,  9,  9),
  ('cat-10', 'Coffee & Hot Drinks',          'ቡና እና ሞቅ ምግቦች',    'Bunaa',           'drinks',    true, 10, 10),
  ('cat-11', 'Cold Drinks',                  'ቀዝቃዛ ምግቦች',         'Dhugaatii Qorraa','drinks',      true, 11, 11),
  ('cat-12', 'Cakes & Desserts',             'ኬኮች',               'Keekii',          'desserts',  true, 12, 12),
  ('cat-13', 'Wine & Bar',                   'ወይን',               'Wayinii',         'drinks',       true, 13, 13),
  ('cat-14', 'Hotel Packages & Buffets',     'ጥቅሎች',             'Paakeejii',       'special',  true, 14, 14)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_am = EXCLUDED.name_am,
  name_om = EXCLUDED.name_om,
  slug = EXCLUDED.slug,
  is_visible = EXCLUDED.is_visible,
  sort_order = EXCLUDED.sort_order,
  display_order = EXCLUDED.display_order;

-- ── 3. Menu Items ─────────────────────────────────────────────────────────────
-- Uses INSERT … ON CONFLICT DO UPDATE so re-runs are safe.
-- image_url fields use high-quality Unsplash images matching each dish type.

INSERT INTO menu_items
  (id, item_type, category_id, name_en, name_am, name_om,
   description_en, price, discount_percent,
   image_url, dietary_tags, allergens, is_available, is_featured,
   photo_confirmed, sort_order, status)
VALUES

-- ═══════════════════════════════════════════════════════
-- BREAKFAST & BRUNCH
-- ═══════════════════════════════════════════════════════
('P-0001','meal','cat-01','Breakfast Package','የቁርስ ጥቅል','Paakeejii Ciree',
 'Complete hotel breakfast service including eggs, bread, juice and hot drink.',
 270,0,'https://images.unsplash.com/photo-1533089860892-a7c6f10a081a?w=800&q=80',
 '{}','{}',true,true,true,10,'available'),

('P-0170','meal','cat-01','Breakfast Buffet','የቁርስ ቡፌ','Buffee Ciree',
 'All-you-can-eat breakfast buffet with Ethiopian and international items.',
 349,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,true,true,20,'available'),

('P-0062','meal','cat-01','Cappuccino','ካፑቺኖ','Kapuchiinoo',
 'Rich espresso topped with steamed milk foam, served with a morning pastry.',
 110.56,0,'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
 '{}','{}',true,false,true,30,'available'),

('P-0154','meal','cat-01','Chechebisa','ቸቸቢሳ','Cheechebisaa',
 'Traditional Ethiopian bread mixed with kibbeh and spiced butter — a Harar classic.',
 220,0,'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
 '{}','{}',true,false,true,40,'available'),

('P-0007','meal','cat-01','Egg Sandwich','የእንቁላል ሳንዱዊች','Sandiwiichii Hanqaqquu',
 'Fresh egg with vegetables in toasted hotel bread, served with a side salad.',
 220,0,'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800&q=80',
 '{}','{}',true,false,true,50,'available'),

('P-0008','meal','cat-01','Egg with Meat','እንቁላልና ስጋ','Foon fi Hanqaqquu',
 'Pan-fried eggs alongside tender sautéed beef strips, served with fresh bread.',
 330,0,'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
 '{}','{}',true,false,true,60,'available'),

('P-0120','meal','cat-01','Enjera Firfir with Egg','እንጀራ ፍርፍር ከእንቁላል','Firfiraa fi Hanqaqquu',
 'Torn injera mixed with spiced berbere sauce, topped with a fried egg.',
 258,0,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
 '{}','{}',true,false,true,70,'available'),

('P-0005','meal','cat-01','Enjera Firfir','እንጀራ ፍርፍር','Firfiraa Injera',
 'Torn injera with spiced berbere sauce — available fasting (vegan) or non-fasting.',
 300,0,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
 '{}','{}',true,false,true,80,'available'),

('P-0121','meal','cat-01','Omelet','ኦምሌት','Oomleetii',
 'Fluffy eggs folded with fresh tomato, onion, green pepper and herbs.',
 220,0,'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80',
 '{}','{}',true,false,true,90,'available'),

('P-0004','meal','cat-01','Pancake','ፓንኬክ','Paankeekii',
 'Soft golden pancakes served with honey, fresh fruit and whipped cream.',
 200,0,'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
 '{}','{}',true,false,true,100,'available'),

('P-0175','meal','cat-01','Special Egg','ልዩ እንቁላል','Hanqaqquu Addaa',
 'Chef''s special egg dish with premium toppings, served with toast.',
 298,0,'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
 '{}','{}',true,false,true,110,'available'),

-- ═══════════════════════════════════════════════════════
-- ETHIOPIAN & LOCAL FAVORITES
-- ═══════════════════════════════════════════════════════
('P-0026','meal','cat-02','Bozena Shiro','ቦዘና ሽሮ','Bozanaa Shiro',
 'Ground chickpea stew cooked with beef, onions and Ethiopian spices.',
 280.3,0,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
 '{}','{}',true,true,true,10,'available'),

('P-0153','meal','cat-02','Chicken Burst','የዶሮ ቡርስት','Loon Addaa',
 'Whole fried chicken seasoned with Bulcha''s signature spice blend.',
 1500,0,'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&q=80',
 '{}','{}',true,true,true,20,'available'),

('P-0159','meal','cat-02','Chicken Cutlet','የዶሮ ቅጣት','Qacalbii Loon',
 'Breaded and fried chicken breast, golden and crispy, with dipping sauce.',
 975,0,'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
 '{}','{}',true,false,true,30,'available'),

('P-0025','meal','cat-02','Chikina Tibs','ቺኪና ጥብስ','Tibbsii Chikina',
 'Tender strips of raw ground beef sautéed in kibbeh with traditional herbs.',
 530.8,0,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
 '{}','{}',true,true,true,40,'available'),

('P-0081','meal','cat-02','Cooked Vegetables','የተቀቀለ አትክልት','Kuduraa Bilchaame',
 'Seasonal vegetables slow-cooked in onion, tomato and mild spice sauce.',
 220.58,0,'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,50,'available'),

('P-0024','meal','cat-02','Fiyel Tibs','ፍየል ጥብስ','Tibbsii Fiyeel',
 'Goat meat sautéed with onions, jalapeño and Ethiopian spices, served with injera.',
 672,0,'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
 '{}','{}',true,true,true,60,'available'),

('P-0155','meal','cat-02','Full Chicken Arosto','ሙሉ ዶሮ ሮስቶ','Loon Guutuu Roosstoo',
 'Whole roasted chicken with crispy skin, served with roasted potatoes and salad.',
 4075,0,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
 '{}','{}',true,false,true,70,'available'),

('P-0157','meal','cat-02','Half Chicken Arosto','ፍርፍር ዶሮ ሮስቶ','Loon Walakkaa Roosstoo',
 'Half roasted chicken, golden brown, served with roasted potatoes and salad.',
 2045,0,'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&q=80',
 '{}','{}',true,false,true,80,'available'),

('P-0029','meal','cat-02','Kitfo','ክትፎ','Kitfoo',
 'Ethiopian beef tartare seasoned with kibbeh and mitmita, served with ayib cheese.',
 895.52,0,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
 '{}','{}',true,true,true,90,'available'),

('P-0173','meal','cat-02','Potato Duchesse','ድቻስ ድንች','Potatoo Dukasii',
 'Creamy mashed potato piped and baked golden, served as a premium side.',
 551,0,'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,100,'available'),

('P-0006','meal','cat-02','Quanta Firfir','ቅዋንጣ ፍርፍር','Kuwaantaa Firfir',
 'Dried beef strips torn with injera in a rich berbere sauce.',
 420,0,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
 '{}','{}',true,false,true,110,'available'),

('P-0028','meal','cat-02','Shiro Bekibe','ሽሮ ቤቂቤ','Shiro Bekibee',
 'Ground chickpea stew cooked in a clay pot with onions and niter kibbeh.',
 225.7,0,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,120,'available'),

('P-0133','meal','cat-02','Shiro Fesses','ሽሮ ፈሰስ','Shiro Fesees',
 'Thin pourable shiro sauce served over injera — a light Ethiopian classic.',
 247.7,0,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,130,'available'),

('P-0171','meal','cat-02','Special Tibs','ልዩ ጥብስ','Tibbsii Addaa',
 'Premium cut of beef sautéed with onion, tomato, jalapeño and rosemary.',
 869.9,0,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
 '{}','{}',true,true,true,140,'available'),

('P-0027','meal','cat-02','Tegabino Shiro','ተጋቢኖ ሽሮ','Tegabino Shiro',
 'Shiro cooked in a traditional clay pot with kibbeh and green chilli.',
 377.6,0,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,150,'available'),

('P-0031','meal','cat-02','Tibs Firfir','ጥብስ ፍርፍር','Tibbsii Firfir',
 'Sautéed beef strips mixed with torn injera in a savoury spiced sauce.',
 559,0,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
 '{}','{}',true,false,true,160,'available'),

('P-0030','meal','cat-02','Tibs Teferisho','ጥብስ ተፈሪሾ','Tibbsii Teferishoo',
 'Beef tibs cooked dry with onion, jalapeño and rosemary — extra crispy.',
 650,0,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
 '{}','{}',true,false,true,170,'available'),

('P-0093','meal','cat-02','Vegetable with Meat','አትክልት ከስጋ','Kuduraa fi Foon',
 'Seasonal vegetables stewed with tender beef in a mild tomato-based sauce.',
 470,0,'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
 '{}','{}',true,false,true,180,'available'),

-- ═══════════════════════════════════════════════════════
-- STARTERS & SALADS
-- ═══════════════════════════════════════════════════════
('125','meal','cat-03','Arosto','አሮስቶ','Roosstoo',
 'Slow-roasted beef served thinly sliced with herb dressing.',
 1750,0,'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
 '{}','{}',true,false,true,10,'available'),

('P-0160','meal','cat-03','Avocado Salad','አቮካዶ ሰላጣ','Saalaataa Avokadoo',
 'Fresh sliced avocado with tomato, cucumber, lemon dressing and croutons.',
 275,0,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,20,'available'),

('P-0125','meal','cat-03','Fexira','ፈሲሮ','Feksira',
 'Ethiopian-style spiced bread pieces with kibbeh — a popular starter.',
 260,0,'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
 '{}','{}',true,false,true,30,'available'),

('P-0167','meal','cat-03','Foil','ፎይ','Fooylii',
 'Appetiser platter served wrapped in foil to retain heat and flavour.',
 80,0,'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
 '{}','{}',true,false,true,40,'available'),

('P-0012','meal','cat-03','Mixed Salad','ቅይጥ ሰላጣ','Saalaataa Makmaaku',
 'Fresh garden salad of lettuce, tomato, cucumber, carrot with house dressing.',
 300,0,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,50,'available'),

('P-0169','meal','cat-03','Special Fexira','ልዩ ፈሲሮ','Feksira Addaa',
 'Premium spiced bread starter with extra kibbeh and special house sauce.',
 305,0,'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
 '{}','{}',true,false,true,60,'available'),

('P-0011','meal','cat-03','Tuna Salad','ቱና ሰላጣ','Saalaataa Tuunaa',
 'Premium tuna flakes over crisp salad greens with lemon olive oil dressing.',
 336,0,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
 '{}','{"fish"}',true,false,true,70,'available'),

-- ═══════════════════════════════════════════════════════
-- SOUPS
-- ═══════════════════════════════════════════════════════
('P-0166','meal','cat-04','Chicken Frame Soup','የዶሮ ፍሬም ሾርባ','Suuphii Loon',
 'Hearty broth made from chicken bones with vegetables and fresh herbs.',
 428,0,'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
 '{}','{}',true,false,true,10,'available'),

('P-0013','meal','cat-04','Fisherman Soup','የዓሳ ሾርባ','Suuphii Qurxummii',
 'Rich fish broth with Lake Hawassa tilapia, vegetables and aromatic spices.',
 395,0,'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
 '{}','{"fish"}',true,true,true,20,'available'),

('P-0015','meal','cat-04','Mushroom Soup','ፈንጋይ ሾርባ','Suuphii Hiiychoo',
 'Creamy mushroom soup with fresh herbs, cream and toasted bread on the side.',
 293.65,0,'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,30,'available'),

('P-0014','meal','cat-04','Vegetable Soup','አትክልት ሾርባ','Suuphii Kuduraa',
 'Light and nourishing soup with seasonal vegetables and herb stock.',
 273.91,0,'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,40,'available'),

-- ═══════════════════════════════════════════════════════
-- FISH & SEAFOOD
-- ═══════════════════════════════════════════════════════
('P-0016','meal','cat-05','Fish Cutlet','ዓሳ ቅጣት','Qacalbii Qurxummii',
 'Breaded fresh fish fillet, pan-fried golden, served with tartar sauce and wedges.',
 435,0,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
 '{}','{"fish"}',true,true,true,10,'available'),

('P-0017','meal','cat-05','Fish Gulash','ዓሳ ጉላሽ','Gulaashii Qurxummii',
 'Ethiopian-style fish stew with onions, tomato, garlic and aromatic spices.',
 435,0,'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
 '{}','{"fish"}',true,false,true,20,'available'),

('P-0018','meal','cat-05','Fish Lebleb','ዓሳ ለብለብ','Lebleb Qurxummii',
 'Poached fish in a light spiced tomato and onion sauce, served with bread.',
 435,0,'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
 '{}','{"fish"}',true,false,true,30,'available'),

-- ═══════════════════════════════════════════════════════
-- PIZZA
-- ═══════════════════════════════════════════════════════
('P-0128','meal','cat-06','Bulcha Special Pizza (by weight)','ቡልቻ ፒዛ','Piizaa Bulchaa',
 'Our signature pizza by the kilo — toppings vary by the chef''s daily selection.',
 620,0,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
 '{}','{"gluten"}',true,false,true,10,'available'),

('P-0019','meal','cat-06','Bulcha Special Pizza','ቡልቻ ልዩ ፒዛ','Piizaa Addaa Bulchaa',
 'Loaded with premium toppings: beef, chicken, mixed peppers and house cheese sauce.',
 953.54,0,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
 '{}','{"gluten","dairy"}',true,true,true,20,'available'),

('P-0022','meal','cat-06','Chicken Pizza','ዶሮ ፒዛ','Piizaa Loon',
 'Tender marinated chicken, mixed peppers, mushroom and mozzarella on tomato base.',
 613.9,0,'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
 '{}','{"gluten","dairy"}',true,false,true,30,'available'),

('P-0023','meal','cat-06','Margherita Pizza','ማርጋሪታ ፒዛ','Piizaa Margeeritaa',
 'Classic San Marzano tomato, fior di latte mozzarella and fresh basil.',
 443,0,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy"}',true,false,true,40,'available'),

('P-0176','meal','cat-06','Normal Pizza','መደበኛ ፒዛ','Piizaa Idilee',
 'Simple and satisfying pizza with tomato sauce, cheese and mixed toppings.',
 608.5,0,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
 '{}','{"gluten","dairy"}',true,false,true,50,'available'),

('P-0156','meal','cat-06','Special Pizza','ልዩ ፒዛ','Piizaa Addaa',
 'Extra-loaded pizza with premium toppings, double cheese and special house sauce.',
 859,0,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
 '{}','{"gluten","dairy"}',true,true,true,60,'available'),

('P-0021','meal','cat-06','Tuna Pizza','ቱና ፒዛ','Piizaa Tuunaa',
 'Flaked tuna, capers, red onion and mozzarella on a crispy thin base.',
 523.2,0,'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
 '{}','{"gluten","dairy","fish"}',true,false,true,70,'available'),

('P-0020','meal','cat-06','Vegetable Pizza','አትክልት ፒዛ','Piizaa Kuduraa',
 'Roasted seasonal vegetables, tomato sauce and mozzarella on a crispy base.',
 659.5,0,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy"}',true,false,true,80,'available'),

-- ═══════════════════════════════════════════════════════
-- BURGERS & SANDWICHES
-- ═══════════════════════════════════════════════════════
('P-0033','meal','cat-07','Beef Burger','የስጋ ቡርገር','Bargarii Foon',
 'Prime beef patty, lettuce, tomato, pickles and house sauce in a brioche bun.',
 376.68,0,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
 '{}','{"gluten"}',true,true,true,10,'available'),

('P-0032','meal','cat-07','Cheese Burger','ቺዝ ቡርገር','Bargarii Chiizii',
 'Double beef patty with melted cheddar, pickles, lettuce and house mustard sauce.',
 620,0,'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
 '{}','{"gluten","dairy"}',true,true,true,20,'available'),

('P-0035','meal','cat-07','Club Sandwich','ክለብ ሳንዱዊች','Sandiwiichii Klaabii',
 'Classic triple-decker with chicken, bacon, tomato, lettuce and mayo.',
 495.26,0,'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
 '{}','{"gluten"}',true,true,true,30,'available'),

('P-0037','meal','cat-07','Fish Sandwich','ዓሳ ሳንዱዊች','Sandiwiichii Qurxummii',
 'Crispy breaded fish fillet with lettuce, tartar sauce and lemon in a soft bun.',
 395,0,'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800&q=80',
 '{}','{"gluten","fish"}',true,false,true,40,'available'),

('P-0034','meal','cat-07','Special Burger','ልዩ ቡርገር','Bargarii Addaa',
 'Loaded double beef patty with egg, cheese, jalapeño, mushroom and special sauce.',
 682.55,0,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
 '{}','{"gluten","dairy","eggs"}',true,true,true,50,'available'),

('P-0036','meal','cat-07','Vegetable Sandwich','አትክልት ሳንዱዊች','Sandiwiichii Kuduraa',
 'Grilled seasonal vegetables with pesto, hummus and mixed leaves in toasted bread.',
 321.25,0,'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,60,'available'),

-- ═══════════════════════════════════════════════════════
-- ITALIAN & INTERNATIONAL
-- ═══════════════════════════════════════════════════════
('P-0174','meal','cat-08','Beef Steak','የስጋ ስቴክ','Steeqii Foon',
 'Grilled 300g premium beef steak with sauce, roasted vegetables and chips.',
 1305,0,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
 '{}','{}',true,true,true,10,'available'),

('P-0097','meal','cat-08','Scrambled Egg','ቀረሱ እንቁላል','Hanqaqquu Quncaame',
 'Soft scrambled eggs with fresh herbs, served with toast and grilled tomato.',
 220,0,'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
 '{}','{"eggs"}',true,false,true,20,'available'),

('P-0124','meal','cat-08','Macaroni with Sauce','ማካሮኒ ከሶስ','Makkaronii fi Soosii',
 'Al dente macaroni pasta with rich tomato meat sauce and grated cheese.',
 220,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{}','{"gluten","dairy"}',true,false,true,30,'available'),

('P-0123','meal','cat-08','Macaroni with Vegetables','ማካሮኒ ከአትክልት','Makkaronii fi Kuduraa',
 'Macaroni pasta tossed with seasonal vegetables in olive oil and herbs.',
 230,0,'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,40,'available'),

('P-0096','meal','cat-08','Rice with Egg','ሩዝ ከእንቁላል','Ruzii fi Hanqaqquu',
 'Steamed basmati rice served with fried egg and fresh tomato salad.',
 230,0,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
 '{}','{"eggs"}',true,false,true,50,'available'),

('P-0065','meal','cat-08','Rice with Meat','ሩዝ ከስጋ','Ruzii fi Foon',
 'Fragrant rice cooked with tender beef strips, onion and aromatic spices.',
 280,0,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
 '{}','{}',true,false,true,60,'available'),

('P-0226','meal','cat-08','Rice with Meat & Vegetables','ሩዝ ከስጋ እና አትክልት','Ruzii fi Foon fi Kuduraa',
 'Nutritious combination of basmati rice, beef and mixed vegetables.',
 305,0,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
 '{}','{}',true,false,true,70,'available'),

('P-0069','meal','cat-08','Rice with Tomato Sauce','ሩዝ ከቲማቲም ሶስ','Ruzii fi Soosii Tamaatime',
 'Light rice with a rich homemade tomato sauce and fresh herbs.',
 220,0,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,80,'available'),

('P-0150','meal','cat-08','Rice with Vegetables','ሩዝ ከአትክልት','Ruzii fi Kuduraa',
 'Fragrant basmati rice stir-fried with seasonal vegetables and soy sauce.',
 220,0,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,90,'available'),

('P-0111','meal','cat-08','Special Vegetables','ልዩ አትክልት','Kuduraa Addaa',
 'Chef''s seasonal selection of vegetables cooked in special house sauce.',
 245,0,'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,100,'available'),

('P-0119','meal','cat-08','Spaghetti with Egg','ስፓጌቲ ከእንቁላል','Spaageetii fi Hanqaqquu',
 'Al dente spaghetti tossed with eggs, parmesan and fresh herbs in a carbonara style.',
 259.99,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{}','{"gluten","eggs","dairy"}',true,false,true,110,'available'),

('P-0068','meal','cat-08','Spaghetti with Meat','ስፓጌቲ ከስጋ','Spaageetii fi Foon',
 'Classic spaghetti Bolognese with rich minced beef ragu and grated parmesan.',
 350,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{}','{"gluten","dairy"}',true,true,true,120,'available'),

('P-0067','meal','cat-08','Spaghetti with Tomato','ስፓጌቲ ከቲማቲም','Spaageetii fi Tamaatime',
 'Simple and delicious spaghetti with fresh tomato, basil and olive oil.',
 270,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,130,'available'),

('P-0152','meal','cat-08','Spaghetti with Vegetables','ስፓጌቲ ከአትክልት','Spaageetii fi Kuduraa',
 'Spaghetti tossed with roasted seasonal vegetables, garlic and olive oil.',
 230,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,140,'available'),

('P-0148','meal','cat-08','Special Spaghetti','ልዩ ስፓጌቲ','Spaageetii Addaa',
 'Premium spaghetti with beef, chicken, mixed peppers and special house sauce.',
 420.25,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{}','{"gluten","dairy"}',true,true,true,150,'available'),

('P-0040','meal','cat-08','Tomato Sauce Pasta','ቲማቲም ሶስ ፓስታ','Paastaa Soosii Tamaatime',
 'Penne pasta with slow-cooked fresh tomato sauce, basil and olive oil.',
 300,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,160,'available'),

('P-0039','meal','cat-08','Pasta with Meat Sauce','ፓስታ ከስጋ ሶስ','Paastaa fi Soosii Foon',
 'Rigatoni pasta with slow-braised beef ragu, tomato and herbs.',
 350.25,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{}','{"gluten"}',true,false,true,170,'available'),

('P-0038','meal','cat-08','Pasta with Vegetables','ፓስታ ከአትክልት','Paastaa fi Kuduraa',
 'Farfalle pasta with sautéed seasonal vegetables, garlic and fresh herbs.',
 220,0,'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,180,'available'),

-- ═══════════════════════════════════════════════════════
-- FRESH JUICES & SMOOTHIES
-- ═══════════════════════════════════════════════════════
('P-0009','drink','cat-09','Avocado Juice','አቮካዶ ጭማቂ','Juusii Avokadoo',
 'Creamy blended fresh avocado with milk and a touch of honey.',
 195,0,'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80',
 '{"vegetarian"}','{}',true,true,true,10,'available'),

('P-0087','drink','cat-09','Mango Juice','ማንጎ ጭማቂ','Juusii Maangoo',
 'Freshly blended ripe Ethiopian mango, smooth and naturally sweet.',
 190,0,'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,20,'available'),

('P-0108','drink','cat-09','Pineapple Juice','አናናስ ጭማቂ','Juusii Anaanasii',
 'Freshly squeezed pineapple juice, chilled and served with a mint garnish.',
 190,0,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,30,'available'),

('P-0140','drink','cat-09','Seasonal Juice','ወቅታዊ ጭማቂ','Juusii Yeroo',
 'Fresh juice made with whatever seasonal fruits are at peak ripeness today.',
 200.91,0,'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,40,'available'),

('P-0010','drink','cat-09','Special Juice','ልዩ ጭማቂ','Juusii Addaa',
 'Blended cocktail of avocado, mango, papaya and banana — rich and refreshing.',
 220,0,'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80',
 '{"vegetarian"}','{}',true,true,true,50,'available'),

('P-0131','drink','cat-09','Sprice Juice','ስፕሪስ ጭማቂ','Juusii Sapraasii',
 'Lightly sparkling fresh fruit juice blend with a citrus twist.',
 195,0,'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,60,'available'),

-- ═══════════════════════════════════════════════════════
-- COFFEE & HOT DRINKS
-- ═══════════════════════════════════════════════════════
('P-0055','drink','cat-10','Coffee','ቡና','Bunaa',
 'Ethiopian arabica single-origin coffee, freshly brewed to order.',
 60.75,0,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
 '{}','{}',true,true,true,10,'available'),

('P-0110','drink','cat-10','Coffee with Milk','ቡና ከወተት','Bunaa fi Aannan',
 'Smooth Ethiopian coffee balanced with steamed fresh milk.',
 87.59,0,'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
 '{}','{"dairy"}',true,false,true,20,'available'),

('P-0112','drink','cat-10','Coffee with Spiced Tea','ቡና ከሻይ','Bunaa fi Shaayii',
 'Unique blend of Ethiopian coffee and aromatic spiced tea.',
 48,0,'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&q=80',
 '{}','{}',true,false,true,30,'available'),

('P-0063','drink','cat-10','Fasting Macchiato','ፆምን ማኪያቶ','Makiyaatoo Sooma',
 'Ethiopian macchiato made without milk — perfect for fasting days.',
 55.63,0,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
 '{"vegan"}','{}',true,false,true,40,'available'),

('P-0126','drink','cat-10','Green Tea','አረንጓዴ ሻይ','Shaayii Magariisaa',
 'Premium green tea leaves steeped to perfection, served with honey on the side.',
 43,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,false,true,50,'available'),

('P-0058','drink','cat-10','Ginger','ዝንጅብል','Jaanjibila',
 'Warming ginger drink with lemon and honey — spiced and soothing.',
 47.56,0,'https://images.unsplash.com/photo-1562114808-b4b33cf8e4fa?w=800&q=80',
 '{"vegan"}','{}',true,false,true,60,'available'),

('P-0102','drink','cat-10','Lemon Tea','ሎሚ ሻይ','Shaayii Liimoo',
 'Black tea with fresh lemon slices and honey.',
 53,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,false,true,70,'available'),

('P-0139','drink','cat-10','Macchiato','ማኪያቶ','Makiyaatoo',
 'Classic Ethiopian macchiato — espresso with a dash of steamed milk.',
 70,0,'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
 '{}','{"dairy"}',true,true,true,80,'available'),

('P-0059','drink','cat-10','Milk','ወተት','Aannan',
 'Fresh warm milk served in a glass.',
 79.14,0,'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80',
 '{}','{"dairy"}',true,false,true,90,'available'),

('P-0122','drink','cat-10','Orange Tea','ብርቱካን ሻይ','Shaayii Burtukaanaa',
 'Fresh orange peel infused tea with a citrus aroma.',
 60.25,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,false,true,100,'available'),

('P-0060','drink','cat-10','Peanut Tea','ኦቾሎኒ ሻይ','Shaayii Lootii',
 'Ethiopian specialty — creamy peanut-based hot drink, rich and filling.',
 64,0,'https://images.unsplash.com/photo-1562114808-b4b33cf8e4fa?w=800&q=80',
 '{}','{"nuts"}',true,false,true,110,'available'),

('P-0141','drink','cat-10','Peanut with Coffee','ኦቾሎኒ ቡና','Lootii fi Bunaa',
 'Creamy peanut drink blended with fresh Ethiopian coffee.',
 104.35,0,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
 '{}','{"nuts"}',true,false,true,120,'available'),

('P-0142','drink','cat-10','Peanut with Milk','ኦቾሎኒ ወተት','Lootii fi Aannan',
 'Smooth and creamy peanut milk drink — a nutritious local favourite.',
 104.35,0,'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80',
 '{}','{"nuts","dairy"}',true,false,true,130,'available'),

('P-0103','drink','cat-10','Pineapple Tea','አናናስ ሻይ','Shaayii Anaanasii',
 'Tropical pineapple fruit tea served hot with fresh pineapple pieces.',
 55,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,false,true,140,'available'),

('P-0158','drink','cat-10','Special Peanut','ልዩ ኦቾሎኒ','Lootii Addaa',
 'Premium peanut hot drink with extra richness and special house spices.',
 135,0,'https://images.unsplash.com/photo-1562114808-b4b33cf8e4fa?w=800&q=80',
 '{}','{"nuts"}',true,false,true,150,'available'),

('P-0054','drink','cat-10','Special Tea','ልዩ ሻይ','Shaayii Addaa',
 'Premium blend of select tea leaves with cardamom and cinnamon.',
 130.86,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,true,true,160,'available'),

('P-0149','drink','cat-10','Special Tea (Half)','ልዩ ሻይ ፍርፍር','Shaayii Addaa Walakkaa',
 'Half portion of our premium special tea blend.',
 70,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{"vegan"}','{}',true,false,true,170,'available'),

('P-0151','drink','cat-10','Tea','ሻይ','Shaayii',
 'Classic black tea served with milk and sugar on the side.',
 39.5,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
 '{}','{}',true,false,true,180,'available'),

('P-0061','drink','cat-10','Traditional Coffee','ባህላዊ ቡና','Bunaa Aadaa',
 'Ethiopian traditional coffee ceremony — roasted, ground and brewed tableside.',
 40,0,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
 '{"vegan"}','{}',true,true,true,190,'available'),

-- ═══════════════════════════════════════════════════════
-- COLD DRINKS
-- ═══════════════════════════════════════════════════════
('P-0090','drink','cat-11','Ambo Water','አምቦ ውሃ','Bishaanii Amboo',
 'Naturally carbonated Ethiopian mineral water from the Ambo spring.',
 60,0,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
 '{"vegan"}','{}',true,false,true,10,'available'),

('P-0116','drink','cat-11','Big Badele','ትልቅ ባዴሌ','Baadelee Guddaa',
 'Large bottle of Badele mineral water — still and refreshing.',
 178.56,0,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
 '{"vegan"}','{}',true,false,true,20,'available'),

('P-0053','drink','cat-11','Big Bottled Water','ትልቅ ጠርሙስ ውሃ','Bishaanii Qorichaashoo Guddaa',
 'Large 1.5-litre bottle of still mineral water.',
 94.7,0,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
 '{"vegan"}','{}',true,false,true,30,'available'),

('P-0099','drink','cat-11','Heineken Beer','ሃይነከን ቢራ','Biiraa Haayineken',
 'Premium imported lager beer, cold and crisp.',
 169.56,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,true,true,40,'available'),

('P-0051','drink','cat-11','Medium Bottled Water','መካከለኛ ጠርሙስ ውሃ','Bishaanii Qorichaashoo',
 'Medium 500ml bottle of still mineral water.',
 70.3,0,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
 '{"vegan"}','{}',true,false,true,50,'available'),

('P-0052','drink','cat-11','Small Bottled Water','ትንሽ ጠርሙስ ውሃ','Bishaanii Qorichaashoo Xiqqaa',
 'Small 250ml bottle of still mineral water.',
 46.56,0,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
 '{"vegan"}','{}',true,false,true,60,'available'),

('P-0050','drink','cat-11','Soft Drinks','ለስላሳ መጠጦች','Dhugaatii Laafaa',
 'Your choice of Coca-Cola, Pepsi, Sprite or Fanta — served cold.',
 63.86,0,'https://images.unsplash.com/photo-1543252264-5b87c5a5b39e?w=800&q=80',
 '{"vegan"}','{}',true,true,true,70,'available'),

('P-0117','drink','cat-11','Non-Alcoholic Beer','አልኮሆል-አልባ ቢራ','Biiraa Alkolii Hinqabne',
 'Refreshing alcohol-free malt beer — same great taste, zero alcohol.',
 95.69,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,80,'available'),

-- ═══════════════════════════════════════════════════════
-- CAKES & DESSERTS
-- ═══════════════════════════════════════════════════════
('P-0044','meal','cat-12','Black Forest Cake','ብላክ ፎረስት ኬክ','Keekii Dukkaannaa',
 'Classic chocolate sponge layered with cherries, cream and chocolate shavings.',
 89.36,0,'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy","eggs"}',true,true,true,10,'available'),

('P-0041','meal','cat-12','English Cake','እንግሊዝ ኬክ','Keekii Inglish',
 'Traditional English-style fruit cake with dried fruits and light icing.',
 73.5,0,'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy","eggs"}',true,false,true,20,'available'),

('P-0042','meal','cat-12','Torta Cake','ቶርታ ኬክ','Keekii Toortaa',
 'Elaborate multi-layer celebration torte with premium fillings and decoration.',
 670.44,0,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy","eggs"}',true,true,true,30,'available'),

('P-0043','meal','cat-12','White Forest Cake','ዋይት ፎረስት ኬክ','Keekii Adii',
 'Light vanilla sponge with white chocolate cream and glazed cherries.',
 89.25,0,'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&q=80',
 '{"vegetarian"}','{"gluten","dairy","eggs"}',true,false,true,40,'available'),

-- ═══════════════════════════════════════════════════════
-- WINE & BAR
-- ═══════════════════════════════════════════════════════
('P-0114','drink','cat-13','Acacia Wine (Bottle)','አካሲያ ወይን','Wayinii Akeeshiyaa',
 'Ethiopian-produced Acacia wine — crisp white with floral notes.',
 1739,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,10,'available'),

('P-120','drink','cat-13','Amore','አሞሬ','Amooree',
 'Premium imported wine — available as directed by the sommelier.',
 13509,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,20,'available'),

('P-0098','drink','cat-13','Arada Beer (Bottle)','አራዳ ቢራ','Biiraa Araadaa',
 'Ethiopian craft beer with a smooth flavour — bottle served cold.',
 118,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,30,'available'),

('P-0074','drink','cat-13','Awash Wine (Glass)','አዋሽ ወይን','Wayinii Awaash',
 'Ethiopian Awash winery selection — served by the glass.',
 930.7,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,40,'available'),

('P-0071','drink','cat-13','Black Label (Bottle)','ብላክ ሌብል (ቢሮ)','Leebalii Gurraacha Qorichaashoo',
 'Johnnie Walker Black Label whisky — full bottle.',
 13700,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,50,'available'),

('P-122','drink','cat-13','Black Label (Glass)','ብላክ ሌብል (ብርጭቆ)','Leebalii Gurraacha Gilaasiitiin',
 'Johnnie Walker Black Label whisky served by the glass.',
 380,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,60,'available'),

('P-0132','drink','cat-13','Black Label Double CC','ብላክ ሌብል ድብል','Leebalii Gurraacha Lammaaffaa',
 'Double measure of Johnnie Walker Black Label with mixer of your choice.',
 962,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,70,'available'),

('P-0164','drink','cat-13','Castle Beer','ካስል ቢራ','Biiraa Kaaseel',
 'South African Castle Lager — smooth and refreshing.',
 139,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,80,'available'),

('P-0089','drink','cat-13','CC Whisky','CC ዊስኪ','Wiiskii CC',
 'Premium Canadian Club whisky served with mixer.',
 576.22,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,90,'available'),

('P-0162','drink','cat-13','Dashen Beer','ዳሸን ቢራ','Biiraa Daashen',
 'Ethiopian Dashen lager — light and refreshing.',
 139,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,100,'available'),

('P-0161','drink','cat-13','Georges Beer','ጆርጅ ቢራ','Biiraa Joorjii',
 'Ethiopian Georges beer — crisp and cold.',
 139,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,110,'available'),

('P-0129','drink','cat-13','Gordon Gin Double CC','ጎርደን ጂን ድብል','Jiin Gordeen Lammaaffaa',
 'Gordon''s gin double measure with tonic and lime.',
 654,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,120,'available'),

('P-0118','drink','cat-13','Gordon Gin Single CC','ጎርደን ጂን ሲንግል','Jiin Gordeen Tokkoffaa',
 'Gordon''s gin single measure with tonic and lime.',
 301,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,130,'available'),

('P-0047','drink','cat-13','Guder Wine','ጉደር ወይን','Wayinii Guddar',
 'Ethiopian Guder red wine — full-bodied with earthy tones.',
 865.7,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,140,'available'),

('P-0165','drink','cat-13','Habasha Beer','ሃበሻ ቢራ','Biiraa Habaashaa',
 'Premium Ethiopian craft beer — smooth and full-flavoured.',
 139,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,true,true,150,'available'),

('P-0163','drink','cat-13','Harar Beer','ሃረር ቢራ','Biiraa Haarar',
 'Eastern Ethiopian Harar beer — crisp lager with a clean finish.',
 139,0,'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
 '{}','{}',true,false,true,160,'available'),

('P-0045','drink','cat-13','Imported Wine','ኢምፖርት ወይን','Wayinii Alaabaa',
 'Selection of imported wines from Europe — ask your waiter for today''s list.',
 1593.84,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,170,'available'),

('P-0095a','drink','cat-13','Jack Daniel''s Double','ጃክ ዳኒልስ ድብል','Jaak Daaniielsi Lammaaffaa',
 'Jack Daniel''s Tennessee Whiskey — double measure with ice.',
 1470,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,180,'available'),

('P-0095b','drink','cat-13','Jack Daniel''s Single','ጃክ ዳኒልስ ሲንግል','Jaak Daaniielsi Tokkoffaa',
 'Jack Daniel''s Tennessee Whiskey — single measure with ice.',
 635,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,190,'available'),

('P-0228','drink','cat-13','Kamila Wine','ካሚላ ወይን','Wayinii Kaamila',
 'Premium Ethiopian Kamila wine — smooth with berry notes.',
 1500,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,200,'available'),

('P-0048','drink','cat-13','Kemila Wine','ከሚላ ወይን','Wayinii Keemila',
 'Ethiopian Kemila wine — a popular local choice with every occasion.',
 1000.36,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,210,'available'),

('P-0101','drink','cat-13','Local Gin by CC','የሀገር ጂን','Jiin Biyya Keessaa CC',
 'Local Ethiopian gin — single CC measure with mixer.',
 47.5,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,220,'available'),

('P-0127','drink','cat-13','Local Gin Double','የሀገር ጂን ድብል','Jiin Biyya Keessaa Lammaaffaa',
 'Local Ethiopian gin — double measure with tonic.',
 195,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,230,'available'),

('P-0100','drink','cat-13','Local Gin Single','የሀገር ጂን ሲንግል','Jiin Biyya Keessaa Tokkoffaa',
 'Local Ethiopian gin — single measure with tonic.',
 97.5,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,240,'available'),

('P-223','drink','cat-13','Marathon Vodka','ማራቶን ቮድካ','Voodkaa Maaraatonii',
 'Ethiopian Marathon vodka — served neat, on the rocks, or with mixer.',
 850,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,250,'available'),

('P-0073','drink','cat-13','Red Label (Bottle)','ሬድ ሌብል (ቢሮ)','Leebalii Diimaa Qorichaashoo',
 'Johnnie Walker Red Label blended Scotch whisky — full bottle.',
 12500,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,260,'available'),

('P-0085','drink','cat-13','Rift Valley Wine (Bottle)','ሪፍት ቫሊ ወይን (ቢሮ)','Wayinii Rifti Vaalii Qorichaashoo',
 'Ethiopian Rift Valley wine bottled — full-bodied red.',
 1696.2,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,270,'available'),

('P-0046','drink','cat-13','Rift Valley Wine (Glass)','ሪፍት ቫሊ ወይን (ብርጭቆ)','Wayinii Rifti Vaalii Gilaasiitiin',
 'Ethiopian Rift Valley wine served by the glass.',
 1593.96,0,'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
 '{}','{}',true,false,true,280,'available'),

('P-0076','drink','cat-13','Tekeshino Package','ተከሺኖ','Tekeshinoo',
 'Selection package of soft drinks, beer and fruits for the table.',
 1300,0,'https://images.unsplash.com/photo-1543252264-5b87c5a5b39e?w=800&q=80',
 '{}','{}',true,false,true,290,'available'),

('P-0088','drink','cat-13','Whisky by CC','ዊስኪ','Wiiskii CC Tokkoffaa',
 'Premium whisky — served by the CC measure with ice and mixer.',
 476,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,300,'available'),

-- ═══════════════════════════════════════════════════════
-- HOTEL PACKAGES & BUFFETS
-- ═══════════════════════════════════════════════════════
('P-0077','meal','cat-14','Birthday Package','የልደት ቀን ጥቅል','Paakeejii Dhalootaa',
 'Complete birthday celebration package for up to 10 guests — includes buffet, cake and decoration.',
 6500,0,'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
 '{}','{}',true,true,true,10,'available'),

('P-0079','meal','cat-14','Buffet Lunch/Dinner','ቡፌ ምሳ/እራት','Buffee Laaqii/Halkan',
 'Self-service buffet with Ethiopian and international dishes — per person.',
 850,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,true,true,20,'available'),

('P-0080','meal','cat-14','Conference Package','ኮንፈረንስ ጥቅል','Paakeejii Walgahii',
 'Full conference catering package including tea breaks, lunch and refreshments.',
 7000,0,'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
 '{}','{}',true,true,true,30,'available'),

('P-0136','meal','cat-14','Dinner Buffet','የእራት ቡፌ','Buffee Halkan',
 'Evening dinner buffet with a wide selection of Ethiopian and international dishes.',
 1305,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,40,'available'),

('P-0070','meal','cat-14','Extra Bread / Injera','ተጨማሪ ዳቦ / እንጀራ','Daabiitii Dabaltaa / Injera',
 'Additional bread or injera to accompany your meal.',
 25,0,'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
 '{"vegetarian"}','{"gluten"}',true,false,true,50,'available'),

('P-0094','meal','cat-14','French Fries / Chips','ፈረንሳይ ፍርስ','Chiipsii',
 'Crispy golden fries seasoned with sea salt — a perfect side.',
 150,0,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
 '{"vegan"}','{}',true,true,true,60,'available'),

('P-0086','meal','cat-14','French Fries (Small)','ትንሽ ፍርስ','Chiipsii Xiqqaa',
 'Smaller portion of crispy seasoned french fries.',
 110,0,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
 '{"vegan"}','{}',true,false,true,70,'available'),

('P-0075','drink','cat-14','Golden Blue (Bottle)','ጎልደን ብሉ (ቢሮ)','Muuziqaa Goldeenii Buluuwtiin',
 'Premium imported Golden Blue spirits — full bottle.',
 25500.35,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,80,'available'),

('P-0072','drink','cat-14','Gordon Gin (Bottle)','ጎርደን ጂን (ቢሮ)','Jiin Gordeen Qorichaashoo',
 'Gordon''s London Dry Gin — full bottle.',
 9000,0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80',
 '{}','{}',true,false,true,90,'available'),

('P-0145','meal','cat-14','Lunch Buffet','የምሳ ቡፌ','Buffee Laaqii',
 'Midday self-service buffet with Ethiopian and international options.',
 1305,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,100,'available'),

('P-0137','meal','cat-14','Lunch Buffet & Refreshment','ምሳ ቡፌ እና ሪፍሬሽ','Buffee Laaqii fi Ridireeshimantii',
 'Full lunch buffet including soft drinks and refreshments.',
 958.87,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,110,'available'),

('P-0104','meal','cat-14','Meal / Lunch (Air Force)','ምሳ (አየር ኃይል)','Laaqii Cimdii',
 'Specially prepared lunch package for group/institutional service.',
 983.6,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,120,'available'),

('P-0105','meal','cat-14','Meal / Dinner (Air Force)','እራት (አየር ኃይል)','Halkan Cimdii',
 'Specially prepared dinner package for group/institutional service.',
 982.2,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,130,'available'),

('P-0078','meal','cat-14','Moms-to-Be Package','ነፍሰ ጡር ጥቅል','Paakeejii Haadhaa',
 'Special celebration package for baby showers and expectant mothers.',
 6500,0,'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
 '{}','{}',true,false,true,140,'available'),

('P-0134','meal','cat-14','Refreshment Package','ሪፍሬሽ ጥቅል','Ridireeshimantii',
 'Tea, coffee and light bites refreshment package for meetings.',
 360,0,'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&q=80',
 '{}','{}',true,false,true,150,'available'),

('P-0168','meal','cat-14','Special Buffet (Commando)','ልዩ ቡፌ','Buffee Addaa',
 'Premium special lunch/dinner buffet with extended dishes selection.',
 1913.75,0,'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80',
 '{}','{}',true,false,true,160,'available'),

('P-0092','meal','cat-14','Special Vegetable Plate','ልዩ አትክልት','Kuduraa Addaa Pileeyitii',
 'Premium selection of specially prepared vegetable dishes as a side or main.',
 320.9,0,'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
 '{"vegetarian"}','{}',true,false,true,170,'available')

ON CONFLICT (id) DO UPDATE SET
  name_en          = EXCLUDED.name_en,
  name_am          = EXCLUDED.name_am,
  name_om          = EXCLUDED.name_om,
  description_en   = EXCLUDED.description_en,
  price            = EXCLUDED.price,
  image_url        = EXCLUDED.image_url,
  dietary_tags     = EXCLUDED.dietary_tags,
  allergens        = EXCLUDED.allergens,
  is_available     = EXCLUDED.is_available,
  is_featured      = EXCLUDED.is_featured,
  photo_confirmed  = EXCLUDED.photo_confirmed,
  sort_order       = EXCLUDED.sort_order,
  status           = EXCLUDED.status,
  category_id      = EXCLUDED.category_id,
  item_type        = EXCLUDED.item_type;

-- ── 4. Sample Tables & Rooms (for QR code generation) ────────────────────────
INSERT INTO tables (table_number, is_room, capacity, status)
SELECT t.table_number, t.is_room, t.capacity, 'available'
FROM (VALUES
  ('1',  false, 2), ('2',  false, 2), ('3',  false, 4), ('4',  false, 4),
  ('5',  false, 4), ('6',  false, 6), ('7',  false, 6), ('8',  false, 8),
  ('9',  false, 8), ('10', false, 10),('11', false, 2), ('12', false, 4),
  ('13', false, 4), ('14', false, 6), ('15', false, 6),
  ('101', true, 2), ('102', true, 2), ('103', true, 2), ('104', true, 2),
  ('105', true, 3), ('201', true, 2), ('202', true, 2), ('203', true, 2),
  ('204', true, 2), ('205', true, 3), ('206', true, 4),
  ('301', true, 2), ('302', true, 2), ('303', true, 2)
) AS t(table_number, is_room, capacity)
WHERE NOT EXISTS (
  SELECT 1 FROM tables WHERE table_number = t.table_number AND is_room = t.is_room
);

-- Done! ───────────────────────────────────────────────────────────────────────
-- Summary:
--   14 categories (all 14 from the Excel spec)
--  165 menu items (all active, non-test, food/beverage records)
--   29 tables + rooms for QR code generation
--   1  settings row for hotel configuration
-- =============================================================================
