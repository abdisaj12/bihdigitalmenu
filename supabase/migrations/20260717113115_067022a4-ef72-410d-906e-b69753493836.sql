UPDATE public.profiles SET theme = 'dark' WHERE theme IS NULL;
ALTER TABLE public.profiles ALTER COLUMN theme SET DEFAULT 'dark';
ALTER TABLE public.profiles ALTER COLUMN theme SET NOT NULL;