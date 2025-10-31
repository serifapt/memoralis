-- Create obituaries table
CREATE TABLE IF NOT EXISTS public.obituaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Personal info
  freguesia TEXT,
  locality TEXT,
  birth_place TEXT,
  nationality TEXT,
  civil_status TEXT,
  profession TEXT,
  id_card TEXT,
  tax_id TEXT,
  social_security TEXT,
  beneficiary TEXT,
  -- Death info
  death_location TEXT,
  death_time TIME,
  cause TEXT,
  doctor TEXT,
  medical_certificate TEXT,
  -- Public message
  public_message TEXT,
  -- Family info
  family_name TEXT,
  family_relationship TEXT,
  family_email TEXT,
  family_phone TEXT,
  family_nif TEXT,
  family_address TEXT,
  family_locality TEXT,
  family_postal_code TEXT,
  family_observations TEXT,
  -- Service info
  service_type TEXT,
  coffin_brand TEXT,
  coffin_ref TEXT,
  service_price NUMERIC,
  observations TEXT,
  hide_condolences BOOLEAN DEFAULT false,
  photo_url TEXT
);

-- Create obituary_relationships table for family connections
CREATE TABLE IF NOT EXISTS public.obituary_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  related_obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(obituary_id, related_obituary_id)
);

-- Create ceremony_events table for funeral events
CREATE TABLE IF NOT EXISTS public.ceremony_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- velorio, cerimonia, funeral, cremacao, missa_7, missa_30, missa_1ano
  event_date DATE,
  event_time TIME,
  location TEXT,
  map_link TEXT,
  responsible_name TEXT,
  responsible_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.obituaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obituary_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceremony_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for obituaries
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

-- RLS Policies for obituary_relationships
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

-- RLS Policies for ceremony_events
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

-- Create indexes for better performance
CREATE INDEX idx_obituaries_funeraria ON public.obituaries(funeraria_id);
CREATE INDEX idx_obituary_relationships_obituary ON public.obituary_relationships(obituary_id);
CREATE INDEX idx_obituary_relationships_related ON public.obituary_relationships(related_obituary_id);
CREATE INDEX idx_ceremony_events_obituary ON public.ceremony_events(obituary_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_obituaries_updated_at
BEFORE UPDATE ON public.obituaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();