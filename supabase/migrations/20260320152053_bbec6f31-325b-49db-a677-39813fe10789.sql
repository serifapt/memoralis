-- Drop old policy that requires both is_public AND is_completed
DROP POLICY IF EXISTS "Public can view published obituaries" ON public.obituaries;

-- Create new policy that only requires is_public
CREATE POLICY "Public can view published obituaries"
  ON public.obituaries
  FOR SELECT
  TO public
  USING (is_public = true);

-- Also update ceremony_events public policy to match
DROP POLICY IF EXISTS "Public can view published ceremony events" ON public.ceremony_events;

CREATE POLICY "Public can view published ceremony events"
  ON public.ceremony_events
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM obituaries o
    WHERE o.id = ceremony_events.obituary_id
    AND o.is_public = true
  ));