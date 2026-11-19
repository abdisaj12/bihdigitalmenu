-- =============================================================================
-- BULCHA HOTEL — COMPLETE SETUP (Works on existing or new database)
-- Run this ONCE to set up everything from scratch
-- =============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. CREATE ENUMS (Skip if exists)
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'waiter', 'kitchen', 'cashier', 'customer', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.food_category AS ENUM ('breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'special');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled', 'new', 'served', 'paid');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('chapa', 'telebirr', 'cbe_birr', 'visa', 'mastercard', 'cash');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'verifying', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. DROP AND RECREATE CORE TABLES (Clean slate approach)
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop dependent tables first
DROP TABLE IF EXISTS public.price_history CASCADE;
DROP TABLE IF EXISTS public.payment_audit_log CASCADE;
DROP TABLE IF EXISTS public.menu_audit_log CASCADE;
DROP TABLE IF EXISTS public.admin_activity CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.tables CASCADE;
DROP TABLE IF EXISTS public.restaurant_settings CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.validate_menu_order() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(public.app_role, uuid) CASCADE;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. CREATE ALL TABLES FIRST
-- ══════════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone text,
  loyalty_points integer DEFAULT 0,
  theme text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Categories
CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  name_am text NOT NULL DEFAULT '',
  name_om text NOT NULL DEFAULT '',
  slug public.food_category,
  description text,
  image_url text,
  parent_id text,
  active boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Menu Items (Premium Table)
CREATE TABLE public.menu_items (
  id text PRIMARY KEY,
  item_type text NOT NULL DEFAULT 'meal',
  category_id text NOT NULL,
  name_en text NOT NULL,
  name_am text NOT NULL DEFAULT '',
  name_om text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_am text NOT NULL DEFAULT '',
  description_om text NOT NULL DEFAULT '',
  ingredients text NOT NULL DEFAULT '',
  ingredients_am text NOT NULL DEFAULT '',
  ingredients_om text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL CHECK(price >= 0),
  discount_percent numeric(5,2) DEFAULT 0 CHECK(discount_percent >= 0 AND discount_percent <= 100),
  image_url text,
  gallery text[] DEFAULT '{}',
  dietary_tags text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  status text DEFAULT 'available',
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  photo_confirmed boolean DEFAULT false,
  prep_minutes integer,
  size text,
  sort_order integer DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Foods (Legacy Table - kept for compatibility)
CREATE TABLE public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category public.food_category NOT NULL,
  price numeric(12,2) NOT NULL,
  discount_price numeric(12,2),
  status text DEFAULT 'available',
  is_featured boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  is_recommended boolean DEFAULT false,
  is_vegetarian boolean DEFAULT false,
  description text,
  ingredients text,
  image_url text,
  gallery_images json,
  calories integer,
  preparation_time integer,
  rating numeric(3,2),
  subcategory text,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Settings (Premium Table)
CREATE TABLE public.settings (
  id boolean PRIMARY KEY DEFAULT true CHECK(id),
  hotel_name text NOT NULL DEFAULT 'Bulcha International Hotel',
  logo_url text,
  vat_percent numeric NOT NULL DEFAULT 15 CHECK(vat_percent >= 0 AND vat_percent <= 100),
  currency text NOT NULL DEFAULT 'ETB',
  opening_hours text DEFAULT '',
  wifi_name text DEFAULT '',
  wifi_password text DEFAULT '',
  phone text DEFAULT '',
  languages text[] DEFAULT ARRAY['en','am','om'],
  default_language text DEFAULT 'en',
  prices_include_vat boolean DEFAULT false
);

-- Restaurant Settings (Legacy)
CREATE TABLE public.restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL,
  logo text,
  phone text,
  email text,
  address text,
  currency text DEFAULT 'ETB',
  language text DEFAULT 'en',
  theme text DEFAULT 'light',
  opening_hours json,
  facebook text,
  instagram text,
  tiktok text,
  website text,
  singleton boolean DEFAULT true UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tables
CREATE TABLE public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number text NOT NULL,
  room_number text,
  is_room boolean DEFAULT false,
  capacity integer,
  status public.table_status DEFAULT 'available',
  qr_code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(table_number, is_room)
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  submission_id uuid UNIQUE,
  customer_name text DEFAULT 'Hotel guest',
  customer_phone text,
  table_or_room text DEFAULT '',
  table_id uuid REFERENCES public.tables(id),
  room_service boolean DEFAULT false,
  items jsonb DEFAULT '[]'::jsonb,
  status public.order_status DEFAULT 'new',
  payment_status public.payment_status DEFAULT 'pending',
  subtotal numeric(12,2) DEFAULT 0,
  vat numeric(12,2) DEFAULT 0,
  tax numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  coupon_code text,
  note text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_id uuid REFERENCES public.foods(id),
  food_name text NOT NULL,
  quantity integer NOT NULL CHECK(quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  method public.payment_method NOT NULL,
  amount numeric(12,2) NOT NULL,
  status public.payment_status DEFAULT 'pending',
  screenshot_url text,
  transaction_reference text,
  transaction_id text,
  rejection_reason text,
  verified_by uuid REFERENCES auth.users(id),
  verification_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Payment Methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method public.payment_method NOT NULL UNIQUE,
  display_name text NOT NULL,
  merchant_name text,
  account_number text,
  instructions text,
  qr_image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric(5,2),
  discount_amount numeric(12,2),
  active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  usage_limit integer,
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Reservations
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  party_size integer NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  status public.reservation_status DEFAULT 'pending',
  table_id uuid REFERENCES public.tables(id),
  user_id uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment text,
  food_id uuid REFERENCES public.foods(id),
  order_id uuid REFERENCES public.orders(id),
  customer_name text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Loyalty Points
CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  order_id uuid REFERENCES public.orders(id),
  points integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Admin Activity
CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  entity text NOT NULL,
  action text NOT NULL,
  record_id text,
  record_label text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Menu Audit Log
CREATE TABLE public.menu_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES public.foods(id),
  food_name text,
  field text NOT NULL,
  action text NOT NULL,
  old_value text,
  new_value text,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  created_at timestamptz DEFAULT now()
);

-- Price History
CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL,
  old_price numeric(12,2) NOT NULL,
  new_price numeric(12,2) NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Payment Audit Log
CREATE TABLE public.payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id),
  order_id uuid REFERENCES public.orders(id),
  previous_status public.payment_status,
  new_status public.payment_status,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. CREATE HELPER FUNCTIONS (After tables exist)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. CREATE INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_menu_items_category ON public.menu_items(category_id, sort_order);
CREATE INDEX idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_payments_order ON public.payments(order_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. ENABLE ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. CREATE RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Categories: Public can read visible categories
CREATE POLICY categories_public_visible ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Menu Items: Public can read available items
CREATE POLICY menu_public_read ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

-- Menu Items: Admins can do everything
CREATE POLICY menu_admin_all ON public.menu_items
  FOR ALL TO authenticated
  USING (public.has_role('admin'::public.app_role))
  WITH CHECK (public.has_role('admin'::public.app_role));

-- Settings: Everyone can read
CREATE POLICY settings_public_read ON public.settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Settings: Admins can update
CREATE POLICY settings_admin_all ON public.settings
  FOR ALL TO authenticated
  USING (public.has_role('admin'::public.app_role))
  WITH CHECK (public.has_role('admin'::public.app_role));

-- Orders: Anyone can insert
CREATE POLICY orders_insert_all ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Orders: Admins can read all
CREATE POLICY orders_admin_read ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role('admin'::public.app_role));

-- Orders: Admins can update
CREATE POLICY orders_admin_update ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role('admin'::public.app_role))
  WITH CHECK (public.has_role('admin'::public.app_role));

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. CREATE TRIGGERS & FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════════════

-- Validate menu order before insert
CREATE OR REPLACE FUNCTION public.validate_menu_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line jsonb;
  dish public.menu_items%ROWTYPE;
  q integer;
  sum_total numeric := 0;
  rate numeric;
  normalized jsonb := '[]';
BEGIN
  IF NEW.items = '[]'::jsonb THEN
    RAISE EXCEPTION 'Choose at least one menu item';
  END IF;
  
  IF char_length(trim(NEW.table_or_room)) = 0 OR char_length(NEW.table_or_room) > 80 THEN
    RAISE EXCEPTION 'Enter a table or room number';
  END IF;
  
  IF jsonb_typeof(NEW.items) <> 'array' OR jsonb_array_length(NEW.items) > 100 THEN
    RAISE EXCEPTION 'Invalid order';
  END IF;
  
  FOR line IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    SELECT * INTO dish FROM public.menu_items WHERE id = (line->>'id')::text AND is_available;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'An item is no longer available';
    END IF;
    
    q := (line->>'quantity')::integer;
    IF q < 1 OR q > 50 THEN
      RAISE EXCEPTION 'Quantity must be between 1 and 50';
    END IF;
    
    sum_total := sum_total + dish.price * q;
    normalized := normalized || jsonb_build_array(jsonb_build_object(
      'id', dish.id,
      'name', dish.name_en,
      'price', dish.price,
      'quantity', q,
      'note', left(coalesce(line->>'note', ''), 500),
      'image_url', dish.image_url
    ));
  END LOOP;
  
  SELECT vat_percent INTO rate FROM public.settings WHERE id = true;
  rate := coalesce(rate, 15);
  
  NEW.items := normalized;
  NEW.subtotal := round(sum_total, 2);
  NEW.vat := round(sum_total * rate / 100, 2);
  NEW.tax := NEW.vat;
  NEW.total := NEW.subtotal + NEW.vat;
  NEW.status := 'new';
  NEW.user_id := NULL;
  NEW.discount := 0;
  NEW.note := left(NEW.note, 1000);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_menu_order
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_menu_order();

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. GRANT PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT ALL ON public.payment_methods TO service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ SCHEMA READY! Now you can run seed.sql
-- ══════════════════════════════════════════════════════════════════════════════
