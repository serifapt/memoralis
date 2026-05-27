CREATE TABLE public.care_interest_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  locality text,
  parish text,
  cemetery_name text NOT NULL,
  plan_code text,
  message text,
  status text NOT NULL DEFAULT 'new',
  contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_interest_leads TO authenticated;
GRANT INSERT ON public.care_interest_leads TO anon;
GRANT ALL ON public.care_interest_leads TO service_role;

ALTER TABLE public.care_interest_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit interest"
  ON public.care_interest_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all interest leads"
  ON public.care_interest_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update interest leads"
  ON public.care_interest_leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete interest leads"
  ON public.care_interest_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER care_interest_leads_updated_at
  BEFORE UPDATE ON public.care_interest_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_care_interest_leads_created_at ON public.care_interest_leads(created_at DESC);
CREATE INDEX idx_care_interest_leads_status ON public.care_interest_leads(status);