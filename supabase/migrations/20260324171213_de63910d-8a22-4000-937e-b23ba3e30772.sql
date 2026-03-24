
CREATE TABLE public.condolences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  message text NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.condolences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert condolences"
  ON public.condolences FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view approved condolences"
  ON public.condolences FOR SELECT
  TO anon, authenticated
  USING (is_approved = true AND EXISTS (
    SELECT 1 FROM obituaries o WHERE o.id = condolences.obituary_id AND o.is_public = true
  ));

CREATE POLICY "Funerarias can manage own condolences"
  ON public.condolences FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM obituaries o JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = condolences.obituary_id AND f.user_id = auth.uid()
  ));
