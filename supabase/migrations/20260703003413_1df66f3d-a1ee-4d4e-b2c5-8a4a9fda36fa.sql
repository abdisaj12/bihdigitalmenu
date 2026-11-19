CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL DEFAULT 'Bulcha International Hotel',
  logo text,
  phone text,
  email text,
  address text,
  currency text NOT NULL DEFAULT 'ETB',
  language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'light',
  opening_hours jsonb DEFAULT '{}'::jsonb,
  facebook text,
  instagram text,
  tiktok text,
  website text,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.restaurant_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.restaurant_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "settings_admin_update" ON public.restaurant_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_restaurant_settings_updated_at
  BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.restaurant_settings (restaurant_name, currency, language, theme)
VALUES ('Bulcha International Hotel', 'ETB', 'en', 'light')
ON CONFLICT (singleton) DO NOTHING;