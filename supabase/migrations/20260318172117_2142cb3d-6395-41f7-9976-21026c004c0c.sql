
CREATE TABLE public.funeraria_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funeraria_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contacts"
  ON public.funeraria_contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Funeraria owners can view own contacts"
  ON public.funeraria_contacts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

CREATE POLICY "Funeraria owners can update own contacts"
  ON public.funeraria_contacts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

CREATE POLICY "Funeraria owners can delete own contacts"
  ON public.funeraria_contacts FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.funeraria_contacts;
