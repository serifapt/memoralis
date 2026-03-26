
-- 1. Create funeraria_members table
CREATE TABLE public.funeraria_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funeraria_id uuid NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor',
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funeraria_id, user_id)
);

-- 2. Add validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_funeraria_member_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be admin or editor.', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_funeraria_member_role
  BEFORE INSERT OR UPDATE ON public.funeraria_members
  FOR EACH ROW EXECUTE FUNCTION public.validate_funeraria_member_role();

-- 3. Enable RLS
ALTER TABLE public.funeraria_members ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check member role without recursion
CREATE OR REPLACE FUNCTION public.get_funeraria_member_role(_user_id uuid, _funeraria_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.funeraria_members
  WHERE user_id = _user_id AND funeraria_id = _funeraria_id
  LIMIT 1;
$$;

-- 5. RLS Policies
-- Members can view their own funeraria's members
CREATE POLICY "Members can view own funeraria members"
  ON public.funeraria_members
  FOR SELECT
  TO authenticated
  USING (
    public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL
  );

-- Admins can insert members
CREATE POLICY "Admins can insert funeraria members"
  ON public.funeraria_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin'
  );

-- Admins can update members
CREATE POLICY "Admins can update funeraria members"
  ON public.funeraria_members
  FOR UPDATE
  TO authenticated
  USING (
    public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin'
  );

-- Admins can delete members (but not themselves)
CREATE POLICY "Admins can delete funeraria members"
  ON public.funeraria_members
  FOR DELETE
  TO authenticated
  USING (
    public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin'
    AND user_id != auth.uid()
  );

-- Platform admins can manage all
CREATE POLICY "Platform admins can manage all members"
  ON public.funeraria_members
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 6. Seed existing funeraria owners as admins
INSERT INTO public.funeraria_members (funeraria_id, user_id, role)
SELECT id, user_id, 'admin'
FROM public.funerarias
ON CONFLICT (funeraria_id, user_id) DO NOTHING;

-- 7. Update RLS policies on funerarias to allow members access
CREATE POLICY "Members can view own funeraria"
  ON public.funerarias
  FOR SELECT
  TO authenticated
  USING (
    public.get_funeraria_member_role(auth.uid(), id) IS NOT NULL
  );

CREATE POLICY "Members can update own funeraria"
  ON public.funerarias
  FOR UPDATE
  TO authenticated
  USING (
    public.get_funeraria_member_role(auth.uid(), id) = 'admin'
  );

-- 8. Update RLS on related tables to allow members access
-- obituaries
CREATE POLICY "Members can view funeraria obituaries"
  ON public.obituaries FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can insert funeraria obituaries"
  ON public.obituaries FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria obituaries"
  ON public.obituaries FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can delete funeraria obituaries"
  ON public.obituaries FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- clients
CREATE POLICY "Members can view funeraria clients"
  ON public.clients FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can insert funeraria clients"
  ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria clients"
  ON public.clients FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can delete funeraria clients"
  ON public.clients FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- budget_quotes (only admin members)
CREATE POLICY "Admin members can view funeraria quotes"
  ON public.budget_quotes FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

CREATE POLICY "Admin members can insert funeraria quotes"
  ON public.budget_quotes FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

CREATE POLICY "Admin members can update funeraria quotes"
  ON public.budget_quotes FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

CREATE POLICY "Admin members can delete funeraria quotes"
  ON public.budget_quotes FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

-- conversations
CREATE POLICY "Members can view funeraria conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can insert funeraria conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- flower_orders
CREATE POLICY "Members can view funeraria flower orders"
  ON public.flower_orders FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria flower orders"
  ON public.flower_orders FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- flower_products
CREATE POLICY "Members can view funeraria flower products"
  ON public.flower_products FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can manage funeraria flower products"
  ON public.flower_products FOR ALL TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

-- funeraria_contacts
CREATE POLICY "Members can view funeraria contacts"
  ON public.funeraria_contacts FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria contacts"
  ON public.funeraria_contacts FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can delete funeraria contacts"
  ON public.funeraria_contacts FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- funeraria_testimonials
CREATE POLICY "Members can view funeraria testimonials"
  ON public.funeraria_testimonials FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria testimonials"
  ON public.funeraria_testimonials FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can delete funeraria testimonials"
  ON public.funeraria_testimonials FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- funeraria_general_docs
CREATE POLICY "Members can view funeraria general docs"
  ON public.funeraria_general_docs FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can insert funeraria general docs"
  ON public.funeraria_general_docs FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can update funeraria general docs"
  ON public.funeraria_general_docs FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

CREATE POLICY "Members can delete funeraria general docs"
  ON public.funeraria_general_docs FOR DELETE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) IS NOT NULL);

-- budget_quote_settings (admin only)
CREATE POLICY "Admin members can view funeraria quote settings"
  ON public.budget_quote_settings FOR SELECT TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

CREATE POLICY "Admin members can insert funeraria quote settings"
  ON public.budget_quote_settings FOR INSERT TO authenticated
  WITH CHECK (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');

CREATE POLICY "Admin members can update funeraria quote settings"
  ON public.budget_quote_settings FOR UPDATE TO authenticated
  USING (public.get_funeraria_member_role(auth.uid(), funeraria_id) = 'admin');
