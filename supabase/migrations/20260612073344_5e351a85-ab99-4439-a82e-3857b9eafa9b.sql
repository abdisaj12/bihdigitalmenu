
DROP FUNCTION IF EXISTS public.get_order_summary(uuid);

CREATE FUNCTION public.get_order_summary(p_id uuid)
RETURNS TABLE (
  id uuid,
  order_number text,
  customer_name text,
  subtotal numeric,
  tax numeric,
  total numeric,
  payment_status payment_status,
  status order_status,
  room_service boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.customer_name, o.subtotal, o.tax, o.total,
         o.payment_status, o.status, o.room_service, o.created_at
  FROM public.orders o
  WHERE o.id = p_id
    AND (
      o.user_id IS NULL
      OR o.user_id = auth.uid()
      OR public.is_staff(auth.uid())
    );
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_summary(uuid) TO anon, authenticated;
