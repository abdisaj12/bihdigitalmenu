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
  v_count int := 0;
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

  WITH priced AS (
    SELECT COALESCE(f.discount_price, f.price) AS unit_price,
           GREATEST(1, LEAST(50, (i->>'quantity')::int)) AS quantity
    FROM jsonb_array_elements(p_items) AS i
    JOIN public.foods f ON f.id = (i->>'food_id')::uuid
    WHERE f.available = true
      AND f.status NOT IN ('out_of_stock', 'discontinued')
      AND f.archived_at IS NULL
  )
  SELECT count(*), COALESCE(sum(unit_price * quantity), 0) INTO v_count, v_subtotal FROM priced;

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
  SELECT v_order_id,
         f.id,
         f.name,
         COALESCE(f.discount_price, f.price),
         GREATEST(1, LEAST(50, (i->>'quantity')::int)),
         COALESCE(f.discount_price, f.price) * GREATEST(1, LEAST(50, (i->>'quantity')::int)),
         NULLIF(left(COALESCE(i->>'note', ''), 500), '')
  FROM jsonb_array_elements(p_items) AS i
  JOIN public.foods f ON f.id = (i->>'food_id')::uuid
  WHERE f.available = true
    AND f.status NOT IN ('out_of_stock', 'discontinued')
    AND f.archived_at IS NULL;

  RETURN QUERY SELECT o.id, o.order_number FROM public.orders o WHERE o.id = v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, text, uuid, boolean, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, uuid, boolean, text, jsonb) TO anon, authenticated;