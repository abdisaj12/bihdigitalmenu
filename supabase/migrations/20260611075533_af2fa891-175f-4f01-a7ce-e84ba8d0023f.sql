
ALTER TABLE public.foods
  ADD COLUMN IF NOT EXISTS discount_price numeric(10,2) CHECK (discount_price IS NULL OR discount_price >= 0),
  ADD COLUMN IF NOT EXISTS calories integer,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.foods DROP CONSTRAINT IF EXISTS foods_status_check;
ALTER TABLE public.foods ADD CONSTRAINT foods_status_check
  CHECK (status IN ('available','out_of_stock','temporarily_unavailable','seasonal','discontinued'));

CREATE TABLE IF NOT EXISTS public.menu_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES public.foods(id) ON DELETE SET NULL,
  food_name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  field text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.menu_audit_log TO authenticated;
GRANT ALL ON public.menu_audit_log TO service_role;

ALTER TABLE public.menu_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read audit log" ON public.menu_audit_log;
CREATE POLICY "Admins read audit log" ON public.menu_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins write audit log" ON public.menu_audit_log;
CREATE POLICY "Admins write audit log" ON public.menu_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.foods;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Auth read food images" ON storage.objects;
CREATE POLICY "Auth read food images" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'food-images');

DROP POLICY IF EXISTS "Admins upload food images" ON storage.objects;
CREATE POLICY "Admins upload food images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'food-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update food images" ON storage.objects;
CREATE POLICY "Admins update food images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'food-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete food images" ON storage.objects;
CREATE POLICY "Admins delete food images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'food-images' AND public.has_role(auth.uid(), 'admin'));
