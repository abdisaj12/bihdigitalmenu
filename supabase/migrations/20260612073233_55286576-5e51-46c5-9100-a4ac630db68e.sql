
-- 1. Drop overly permissive payments SELECT (always true)
DROP POLICY IF EXISTS "Customers can view their payment" ON public.payments;

-- 2. Drop anon orders enumeration policy
DROP POLICY IF EXISTS "Anon view orders" ON public.orders;

-- 3. Drop public coupons SELECT (exposes times_used/usage_limit)
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;

-- 4. Lock down trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 5. Safe RPC for guests to fetch their order on the payment page
CREATE OR REPLACE FUNCTION public.get_order_summary(p_id uuid)
RETURNS TABLE (
  id uuid,
  order_number text,
  customer_name text,
  total numeric,
  payment_status payment_status,
  status order_status,
  room_service boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.customer_name, o.total,
         o.payment_status, o.status, o.room_service
  FROM public.orders o
  WHERE o.id = p_id
    AND (
      o.user_id IS NULL                          -- guest order, by id
      OR o.user_id = auth.uid()                  -- own order
      OR public.is_staff(auth.uid())             -- staff
    );
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_summary(uuid) TO anon, authenticated;

-- 6. Safe RPC for guests to validate coupons without exposing usage
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text)
RETURNS TABLE (
  code text,
  discount_amount numeric,
  discount_percent numeric,
  valid_until timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.discount_amount, c.discount_percent, c.valid_until
  FROM public.coupons c
  WHERE c.active = true
    AND upper(c.code) = upper(p_code)
    AND (c.valid_until IS NULL OR c.valid_until > now())
    AND (c.valid_from <= now())
    AND (c.usage_limit IS NULL OR c.times_used < c.usage_limit);
$$;

REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon, authenticated;
