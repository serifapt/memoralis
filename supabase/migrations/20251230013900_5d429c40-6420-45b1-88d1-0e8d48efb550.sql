-- Fix 1: Replace overly permissive user_roles INSERT policy
-- The current policy allows ANY authenticated user to insert ANY role for ANY user
-- This is a critical privilege escalation vulnerability

-- Drop the dangerous permissive policy
DROP POLICY IF EXISTS "Allow role creation for new users" ON public.user_roles;

-- Create a restricted policy that only allows users to assign the 'funeraria' role to themselves
CREATE POLICY "Users can assign funeraria role to self"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    role = 'funeraria'::app_role
  );

-- Create a secure function for admin role assignment (admin-only)
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign admin roles';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;