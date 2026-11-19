
CREATE POLICY "Anyone can upload payment receipts"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Staff can view payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND public.is_staff(auth.uid()));
