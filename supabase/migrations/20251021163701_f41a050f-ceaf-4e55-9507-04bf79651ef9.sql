-- Insert a default admin user
-- This creates a user with email: admin@memoralis.pt / password: admin123456
-- IMPORTANT: Change this password after first login!

-- First, we need to insert into auth.users (this is typically done via signUp)
-- Since we can't directly insert into auth.users via migration, 
-- we'll create a function to help with initial admin setup

CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_full_name TEXT DEFAULT 'Administrador'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function should be called via an edge function or manually
  -- For now, we'll just document the manual process
  RETURN 'Para criar um admin, execute: 
  1. Registe-se normalmente via /auth com email admin@memoralis.pt
  2. Execute: INSERT INTO public.user_roles (user_id, role) VALUES ((SELECT id FROM auth.users WHERE email = ''admin@memoralis.pt''), ''admin'');';
END;
$$;

COMMENT ON FUNCTION public.create_admin_user IS 
'Helper function to document admin creation process. 
To create first admin:
1. Sign up via /auth with desired admin email
2. Get user_id from auth.users
3. INSERT INTO user_roles (user_id, role) VALUES (user_id, ''admin'');';