-- =============================================================================
-- PREMIUM FEATURES MIGRATION
-- Adds comprehensive luxury hotel digital menu enhancements
-- =============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. GUEST FAVORITES & RECOMMENDATIONS
-- ══════════════════════════════════════════════════════════════════════════════

-- Add recommendation fields to menu_items
ALTER TABLE public.menu_items 
  ADD COLUMN IF NOT EXISTS is_chef_special boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recommended boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS popularity_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chef_note text,
  ADD COLUMN IF NOT EXISTS pairing_suggestions text,
  ADD COLUMN IF NOT EXISTS origin_story text;

-- Guest favorites tracking
CREATE TABLE IF NOT EXISTS public.guest_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(guest_id, menu_item_id)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ENHANCED ORDERING EXPERIENCE
-- ══════════════════════════════════════════════════════════════════════════════

-- Add order tracking fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS estimated_time integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS actual_prep_time integer,
  ADD COLUMN IF NOT EXISTS preparing_at timestamptz,
  ADD COLUMN IF NOT EXISTS ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS kitchen_notes text,
  ADD COLUMN IF NOT EXISTS rating integer CHECK(rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS review_text text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Order status history tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  notes text,
  staff_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. RICH MEDIA & INTERACTIVITY
-- ══════════════════════════════════════════════════════════════════════════════

-- Menu item media gallery
CREATE TABLE IF NOT EXISTS public.menu_item_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK(media_type IN ('image', 'video', '360')),
  media_url text NOT NULL,
  thumbnail_url text,
  title text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Guest photos
CREATE TABLE IF NOT EXISTS public.guest_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  is_approved boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. SPECIAL FEATURES
-- ══════════════════════════════════════════════════════════════════════════════

-- Daily specials
CREATE TABLE IF NOT EXISTS public.daily_specials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  special_price numeric(12,2) NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  available_quantity integer,
  remaining_quantity integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seasonal menu rotations
CREATE TABLE IF NOT EXISTS public.seasonal_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  menu_item_ids text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add nutritional info to menu_items
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS calories integer,
  ADD COLUMN IF NOT EXISTS protein_g numeric(8,2),
  ADD COLUMN IF NOT EXISTS carbs_g numeric(8,2),
  ADD COLUMN IF NOT EXISTS fat_g numeric(8,2),
  ADD COLUMN IF NOT EXISTS spice_level text CHECK(spice_level IN ('mild', 'medium', 'hot', 'extra_hot')),
  ADD COLUMN IF NOT EXISTS is_halal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_vegetarian boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_vegan boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_gluten_free boolean DEFAULT false;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. GUEST ENGAGEMENT
-- ══════════════════════════════════════════════════════════════════════════════

-- Table service calls
CREATE TABLE IF NOT EXISTS public.service_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_or_room text NOT NULL,
  request_type text NOT NULL CHECK(request_type IN ('waiter', 'bill', 'assistance', 'feedback')),
  message text,
  status text DEFAULT 'pending' CHECK(status IN ('pending', 'acknowledged', 'completed', 'cancelled')),
  responded_by uuid REFERENCES auth.users(id),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Dish reviews and ratings
CREATE TABLE IF NOT EXISTS public.dish_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review_text text,
  is_approved boolean DEFAULT true,
  response_text text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Special occasions
CREATE TABLE IF NOT EXISTS public.special_occasions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  occasion_type text NOT NULL CHECK(occasion_type IN ('birthday', 'anniversary', 'celebration', 'business', 'other')),
  special_requests text,
  guest_name text,
  guest_count integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. SMART FEATURES
-- ══════════════════════════════════════════════════════════════════════════════

-- Search history for analytics
CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term text NOT NULL,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- AI chat conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  table_or_room text,
  messages jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. MARKETING & LOYALTY
-- ══════════════════════════════════════════════════════════════════════════════

-- Loyalty program
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id),
  points integer NOT NULL,
  transaction_type text NOT NULL CHECK(transaction_type IN ('earned', 'redeemed', 'bonus', 'expired')),
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Promotions and offers
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  promo_code text UNIQUE,
  discount_type text NOT NULL CHECK(discount_type IN ('percentage', 'fixed', 'bogo', 'free_item')),
  discount_value numeric(12,2),
  min_order_amount numeric(12,2),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Happy hour settings
CREATE TABLE IF NOT EXISTS public.happy_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  day_of_week integer[] DEFAULT '{1,2,3,4,5,6,7}',
  start_time time NOT NULL,
  end_time time NOT NULL,
  discount_percent numeric(5,2) NOT NULL,
  applicable_categories text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. ADMINISTRATIVE ENHANCEMENTS
-- ══════════════════════════════════════════════════════════════════════════════

-- Kitchen display system
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  station text NOT NULL CHECK(station IN ('hot', 'cold', 'grill', 'pastry', 'bar')),
  items jsonb NOT NULL,
  priority integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'completed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Inventory tracking
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  current_stock integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  unit text DEFAULT 'serving',
  last_restocked_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Staff performance
CREATE TABLE IF NOT EXISTS public.staff_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  orders_handled integer DEFAULT 0,
  avg_response_time integer,
  customer_rating numeric(3,2),
  tips_received numeric(12,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Analytics snapshots
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0,
  avg_order_value numeric(12,2) DEFAULT 0,
  peak_hour integer,
  top_items jsonb DEFAULT '[]',
  customer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. ACCESSIBILITY & CONVENIENCE
-- ══════════════════════════════════════════════════════════════════════════════

-- Multi-course meal builder
CREATE TABLE IF NOT EXISTS public.meal_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  courses jsonb NOT NULL, -- [{course: 'appetizer', item_id: 'xxx'}, ...]
  total_price numeric(12,2) NOT NULL,
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Dietary preferences per guest
CREATE TABLE IF NOT EXISTS public.guest_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_restrictions text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  favorite_cuisines text[] DEFAULT '{}',
  spice_preference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guest_id)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. PREMIUM TOUCH
-- ══════════════════════════════════════════════════════════════════════════════

-- Wine & drink pairings
CREATE TABLE IF NOT EXISTS public.beverage_pairings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  beverage_id text REFERENCES public.menu_items(id),
  pairing_note text,
  sommelier_name text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Sustainability/carbon footprint
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS carbon_footprint_kg numeric(8,3),
  ADD COLUMN IF NOT EXISTS is_locally_sourced boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_organic boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sustainability_rating integer CHECK(sustainability_rating >= 1 AND sustainability_rating <= 5);

-- Chef profiles
CREATE TABLE IF NOT EXISTS public.chef_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  bio text,
  photo_url text,
  specialty text,
  signature_dishes text[],
  created_at timestamptz DEFAULT now()
);

-- Chef notes on dishes
CREATE TABLE IF NOT EXISTS public.chef_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  chef_id uuid REFERENCES public.chef_profiles(id),
  note text NOT NULL,
  video_url text,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON public.menu_items(is_popular, popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_chef_special ON public.menu_items(is_chef_special) WHERE is_chef_special = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_specials_active ON public.daily_specials(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_service_calls_status ON public.service_calls(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dish_reviews_item ON public.dish_reviews(menu_item_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_guest ON public.loyalty_transactions(guest_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.inventory(current_stock) WHERE current_stock <= low_stock_threshold;

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all new tables
ALTER TABLE public.guest_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.happy_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beverage_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_notes ENABLE ROW LEVEL SECURITY;

-- Guest read access to public data
CREATE POLICY "Guests can view menu media" ON public.menu_item_media FOR SELECT USING (true);
CREATE POLICY "Guests can view approved photos" ON public.guest_photos FOR SELECT USING (is_approved = true);
CREATE POLICY "Guests can view active specials" ON public.daily_specials FOR SELECT USING (is_active = true);
CREATE POLICY "Guests can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Guests can view chef profiles" ON public.chef_profiles FOR SELECT USING (true);
CREATE POLICY "Guests can view chef notes" ON public.chef_notes FOR SELECT USING (true);
CREATE POLICY "Guests can view pairings" ON public.beverage_pairings FOR SELECT USING (true);

-- Guest management of their own data
CREATE POLICY "Guests manage own favorites" ON public.guest_favorites FOR ALL USING (guest_id = auth.uid());
CREATE POLICY "Guests manage own reviews" ON public.dish_reviews FOR ALL USING (guest_id = auth.uid());
CREATE POLICY "Guests manage own preferences" ON public.guest_preferences FOR ALL USING (guest_id = auth.uid());
CREATE POLICY "Guests view own loyalty" ON public.loyalty_transactions FOR SELECT USING (guest_id = auth.uid());
CREATE POLICY "Guests create service calls" ON public.service_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests view own service calls" ON public.service_calls FOR SELECT USING (true);

-- Staff access
CREATE POLICY "Staff manage kitchen orders" ON public.kitchen_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'kitchen', 'super_admin'))
);

CREATE POLICY "Staff view inventory" ON public.inventory FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'kitchen', 'super_admin'))
);

CREATE POLICY "Admin full access to analytics" ON public.analytics_daily FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS AND TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Update popularity score based on orders
CREATE OR REPLACE FUNCTION update_popularity_score()
RETURNS trigger AS $$
BEGIN
  UPDATE public.menu_items
  SET popularity_score = popularity_score + 1
  WHERE id = ANY(
    SELECT jsonb_array_elements(NEW.items)->>'id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_popularity
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_popularity_score();

-- Auto-update inventory on order
CREATE OR REPLACE FUNCTION decrement_inventory()
RETURNS trigger AS $$
BEGIN
  UPDATE public.inventory
  SET current_stock = current_stock - 1,
      updated_at = now()
  WHERE menu_item_id = ANY(
    SELECT jsonb_array_elements(NEW.items)->>'id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_on_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION decrement_inventory();

-- Track order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    
    -- Update timestamp fields
    IF NEW.status = 'preparing' THEN
      NEW.preparing_at = now();
    ELSIF NEW.status = 'ready' THEN
      NEW.ready_at = now();
    ELSIF NEW.status = 'delivered' THEN
      NEW.delivered_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- Update loyalty points on order completion
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS trigger AS $$
DECLARE
  guest_uuid uuid;
  points_earned integer;
BEGIN
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN
    -- Calculate points (1 point per 10 ETB spent)
    points_earned := floor(NEW.total / 10);
    
    -- Try to extract guest_id from customer_name if it's a UUID
    BEGIN
      guest_uuid := NEW.customer_name::uuid;
    EXCEPTION WHEN OTHERS THEN
      guest_uuid := NULL;
    END;
    
    IF guest_uuid IS NOT NULL THEN
      -- Add loyalty transaction
      INSERT INTO public.loyalty_transactions (guest_id, order_id, points, transaction_type, description)
      VALUES (guest_uuid, NEW.id, points_earned, 'earned', 'Order #' || NEW.order_number);
      
      -- Update profile points
      UPDATE public.profiles
      SET loyalty_points = loyalty_points + points_earned
      WHERE id = guest_uuid;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_on_payment
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION award_loyalty_points();

-- Insert default settings row if not exists
INSERT INTO public.settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- Insert default inventory for existing menu items
INSERT INTO public.inventory (menu_item_id, current_stock, low_stock_threshold)
SELECT id, 100, 10
FROM public.menu_items
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- VIEWS FOR ANALYTICS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.popular_items AS
SELECT 
  mi.id,
  mi.name_en,
  mi.popularity_score,
  COUNT(DISTINCT dr.id) as review_count,
  AVG(dr.rating) as avg_rating,
  mi.price,
  mi.image_url
FROM public.menu_items mi
LEFT JOIN public.dish_reviews dr ON dr.menu_item_id = mi.id
WHERE mi.is_available = true
GROUP BY mi.id, mi.name_en, mi.popularity_score, mi.price, mi.image_url
ORDER BY mi.popularity_score DESC, avg_rating DESC
LIMIT 20;

CREATE OR REPLACE VIEW public.low_stock_alerts AS
SELECT 
  inv.id,
  mi.name_en,
  inv.current_stock,
  inv.low_stock_threshold,
  mi.category_id
FROM public.inventory inv
JOIN public.menu_items mi ON mi.id = inv.menu_item_id
WHERE inv.current_stock <= inv.low_stock_threshold
ORDER BY inv.current_stock ASC;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ══════════════════════════════════════════════════════════════════════════════

-- All premium features have been added to the database!
