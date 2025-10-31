-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Funerarias can view own obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Funerarias can insert own obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Funerarias can update own obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Funerarias can delete own obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Public can view published obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Funerarias can view own obituary relationships" ON public.obituary_relationships;
DROP POLICY IF EXISTS "Funerarias can manage own obituary relationships" ON public.obituary_relationships;
DROP POLICY IF EXISTS "Funerarias can view own ceremony events" ON public.ceremony_events;
DROP POLICY IF EXISTS "Funerarias can manage own ceremony events" ON public.ceremony_events;
DROP POLICY IF EXISTS "Public can view published ceremony events" ON public.ceremony_events;

-- Create the policies again
CREATE POLICY "Funerarias can view own obituaries"
ON public.obituaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = obituaries.funeraria_id
    AND funerarias.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can insert own obituaries"
ON public.obituaries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = obituaries.funeraria_id
    AND funerarias.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can update own obituaries"
ON public.obituaries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = obituaries.funeraria_id
    AND funerarias.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can delete own obituaries"
ON public.obituaries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = obituaries.funeraria_id
    AND funerarias.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published obituaries"
ON public.obituaries FOR SELECT
USING (is_public = true AND is_completed = true);

CREATE POLICY "Funerarias can view own obituary relationships"
ON public.obituary_relationships FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_relationships.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can manage own obituary relationships"
ON public.obituary_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_relationships.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can view own ceremony events"
ON public.ceremony_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = ceremony_events.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can manage own ceremony events"
ON public.ceremony_events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = ceremony_events.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published ceremony events"
ON public.ceremony_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    WHERE o.id = ceremony_events.obituary_id
    AND o.is_public = true
    AND o.is_completed = true
  )
);