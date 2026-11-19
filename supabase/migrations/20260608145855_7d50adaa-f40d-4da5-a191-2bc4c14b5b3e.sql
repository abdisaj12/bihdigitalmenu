-- Bulcha menu schema additions
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 4.5;
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS ingredients text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS room_service boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_foods_subcategory ON public.foods(subcategory);