DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;

CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Staff can view all payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));