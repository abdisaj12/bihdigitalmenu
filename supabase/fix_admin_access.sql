-- Fix admin access by allowing users to read their own roles

-- Drop existing policies if any
DROP POLICY IF EXISTS user_roles_read_own ON public.user_roles;

-- Allow users to read their own roles
CREATE POLICY user_roles_read_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.user_roles TO authenticated;

-- Verify the fix - check if user can now see their roles
-- Run this after the policy is created:
-- SELECT * FROM user_roles WHERE user_id = auth.uid();
