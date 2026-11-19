-- Guest ordering RPCs (definer, keyed by unguessable order id)

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_phone text DEFAULT NULL,
  p_table_id uuid DEFAULT NULL,
  p_room_service boolean DEFAULT false,
  p_note text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE(id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_total numeric := 0;
  v_count int;
BEGIN
  IF p_customer_name IS NULL OR btrim(p_customer_name) = '' OR length(p_customer_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  IF jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Too many items in one order';
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS _po_items (
    food_id uuid, food_name text, unit_price numeric, quantity int, subtotal numeric, note text
  ) ON COMMIT DROP;
  DELETE FROM _po_items;

  INSERT INTO _po_items (food_id, food_name, unit_price, quantity, subtotal, note)
  SELECT f.id,
         f.name,
         COALESCE(f.discount_price, f.price),
         GREATEST(1, LEAST(50, (i->>'quantity')::int)),
         COALESCE(f.discount_price, f.price) * GREATEST(1, LEAST(50, (i->>'quantity')::int)),
         NULLIF(left(COALESCE(i->>'note', ''), 500), '')
  FROM jsonb_array_elements(p_items) AS i
  JOIN public.foods f ON f.id = (i->>'food_id')::uuid
  WHERE f.available = true AND f.status = 'active';

  SELECT count(*), COALESCE(sum(subtotal), 0) INTO v_count, v_subtotal FROM _po_items;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'None of the selected items are currently available';
  END IF;

  v_tax := round(v_subtotal * 0.15, 2);
  v_total := v_subtotal + v_tax;

  INSERT INTO public.orders (
    customer_name, customer_phone, user_id, table_id, room_service,
    subtotal, tax, discount, total, note, status, payment_status
  ) VALUES (
    btrim(p_customer_name),
    NULLIF(btrim(COALESCE(p_customer_phone, '')), ''),
    auth.uid(),
    p_table_id,
    COALESCE(p_room_service, false),
    v_subtotal, v_tax, 0, v_total,
    NULLIF(left(COALESCE(p_note, ''), 500), ''),
    'pending', 'pending'
  )
  RETURNING orders.id INTO v_order_id;

  INSERT INTO public.order_items (order_id, food_id, food_name, unit_price, quantity, subtotal, note)
  SELECT v_order_id, food_id, food_name, unit_price, quantity, subtotal, note FROM _po_items;

  RETURN QUERY SELECT o.id, o.order_number FROM public.orders o WHERE o.id = v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_order_summary(p_id uuid)
RETURNS TABLE(
  id uuid, order_number text, customer_name text, subtotal numeric, tax numeric,
  total numeric, payment_status payment_status, status order_status,
  room_service boolean, created_at timestamp with time zone
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
$$;

CREATE OR REPLACE FUNCTION public.get_order_items(p_id uuid)
RETURNS TABLE(id uuid, food_name text, quantity int, unit_price numeric, subtotal numeric, note text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.id, oi.food_name, oi.quantity, oi.unit_price, oi.subtotal, oi.note
  FROM public.order_items oi
  WHERE oi.order_id = p_id
  ORDER BY oi.created_at
$$;

CREATE OR REPLACE FUNCTION public.get_order_payment(p_order_id uuid)
RETURNS TABLE(id uuid, status payment_status, transaction_reference text, rejection_reason text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.status, p.transaction_reference, p.rejection_reason
  FROM public.payments p
  WHERE p.order_id = p_order_id
  ORDER BY p.created_at DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.submit_payment(
  p_order_id uuid,
  p_method payment_method,
  p_transaction_reference text DEFAULT NULL,
  p_screenshot_url text DEFAULT NULL
)
RETURNS TABLE(id uuid, status payment_status, transaction_reference text, rejection_reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
  v_status payment_status;
  v_payment_id uuid;
BEGIN
  SELECT o.total INTO v_total FROM public.orders o WHERE o.id = p_order_id;
  IF v_total IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF p_method = 'cash' THEN
    v_status := 'pending';
  ELSE
    IF p_transaction_reference IS NULL OR length(btrim(p_transaction_reference)) < 4 THEN
      RAISE EXCEPTION 'A valid transaction reference is required';
    END IF;
    v_status := 'verifying';
  END IF;

  INSERT INTO public.payments (order_id, method, amount, status, transaction_reference, screenshot_url, notes)
  VALUES (
    p_order_id, p_method, v_total, v_status,
    NULLIF(btrim(COALESCE(p_transaction_reference, '')), ''),
    NULLIF(btrim(COALESCE(p_screenshot_url, '')), ''),
    CASE WHEN p_method = 'cash' THEN 'Pay at counter — staff will mark as paid' ELSE NULL END
  )
  RETURNING payments.id INTO v_payment_id;

  UPDATE public.orders o
     SET payment_status = v_status, updated_at = now()
   WHERE o.id = p_order_id;

  RETURN QUERY
    SELECT p.id, p.status, p.transaction_reference, p.rejection_reason
    FROM public.payments p WHERE p.id = v_payment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, text, uuid, boolean, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_order_summary(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_order_items(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_order_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_payment(uuid, payment_method, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.place_order(text, text, uuid, boolean, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_summary(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_items(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_payment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_payment(uuid, payment_method, text, text) TO anon, authenticated;