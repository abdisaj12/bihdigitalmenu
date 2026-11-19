
-- 1. Extend payment_status enum
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'verifying';
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Payment methods config table
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method public.payment_method NOT NULL UNIQUE,
  display_name text NOT NULL,
  merchant_name text NOT NULL,
  account_number text NOT NULL,
  instructions text,
  qr_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = true OR public.is_staff(auth.uid()));

CREATE POLICY "Admins manage payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Extend payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS transaction_reference text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verification_date timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS payments_txref_unique
  ON public.payments (method, transaction_reference)
  WHERE transaction_reference IS NOT NULL;

-- Allow anonymous customers to submit payment proof for their own order
DROP POLICY IF EXISTS "Anyone can submit payment proof" ON public.payments;
CREATE POLICY "Anyone can submit payment proof"
  ON public.payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view their payment" ON public.payments;
CREATE POLICY "Customers can view their payment"
  ON public.payments FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT INSERT ON public.payments TO anon;
GRANT SELECT ON public.payments TO anon;

-- 4. Audit log
CREATE TABLE public.payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  action text NOT NULL,
  previous_status public.payment_status,
  new_status public.payment_status,
  performed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payment_audit_log TO authenticated;
GRANT ALL ON public.payment_audit_log TO service_role;

ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view audit log"
  ON public.payment_audit_log FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff insert audit log"
  ON public.payment_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND performed_by = auth.uid());

-- 5. Seed default Ethiopian payment methods
INSERT INTO public.payment_methods (method, display_name, merchant_name, account_number, instructions, display_order) VALUES
  ('telebirr', 'Telebirr', 'Bulcha International Hotel', '0912345678', 'Send via Telebirr to the merchant number, then submit the transaction reference shown in your SMS confirmation.', 1),
  ('cbe_birr', 'CBE Birr', 'Bulcha International Hotel', '1000123456789', 'Transfer to the CBE account number, then submit the transaction reference from your receipt.', 2),
  ('chapa', 'Awash Bank', 'Bulcha International Hotel', '2000987654321', 'Transfer to the Awash Bank account number, then submit the transaction reference.', 3),
  ('visa', 'Bank of Abyssinia', 'Bulcha International Hotel', '3000567812345', 'Transfer to the Abyssinia account number, then submit the transaction reference.', 4),
  ('cash', 'Cash', 'Bulcha International Hotel', 'Pay at counter', 'Pay in cash at the counter. Staff will mark your order as paid.', 5)
ON CONFLICT (method) DO NOTHING;
