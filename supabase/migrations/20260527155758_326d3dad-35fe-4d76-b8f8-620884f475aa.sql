
-- Add slug column to obituaries for pretty URLs
ALTER TABLE public.obituaries ADD COLUMN IF NOT EXISTS slug text;

-- Helper: slugify a string (lowercase, strip accents, hyphenate)
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(
      lower(translate(coalesce(input,''),
        'áàâãäåaaaaaaçccdeéèêëeeeefghiíìîïiijklmnnoóòôõöoorrstuúùûüuvwxyýÿz',
        'aaaaaaaaaaaccccdeeeeeeeeefghiiiiiiijklmnnoooooooorrstuuuuuuvwxyyyz')),
      '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'));
$$;

-- Trigger: generate unique slug per funeraria from display_name
CREATE OR REPLACE FUNCTION public.set_obituary_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  candidate text;
  counter int := 1;
BEGIN
  -- regenerate when slug missing, or when display_name changes and slug not user-customized away
  IF NEW.slug IS NULL OR NEW.slug = ''
     OR (TG_OP = 'UPDATE' AND OLD.display_name IS DISTINCT FROM NEW.display_name AND NEW.slug = OLD.slug AND OLD.slug = public.slugify(OLD.display_name)) THEN
    base_slug := public.slugify(coalesce(NEW.display_name, NEW.full_name, 'obituario'));
    IF base_slug = '' THEN base_slug := 'obituario'; END IF;
    candidate := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM public.obituaries
      WHERE funeraria_id = NEW.funeraria_id
        AND slug = candidate
        AND id <> NEW.id
    ) LOOP
      counter := counter + 1;
      candidate := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_obituary_slug ON public.obituaries;
CREATE TRIGGER trg_set_obituary_slug
BEFORE INSERT OR UPDATE OF display_name, slug ON public.obituaries
FOR EACH ROW EXECUTE FUNCTION public.set_obituary_slug();

-- Backfill existing obituaries
DO $$
DECLARE r record; base text; candidate text; counter int;
BEGIN
  FOR r IN SELECT id, funeraria_id, display_name, full_name FROM public.obituaries WHERE slug IS NULL OR slug = '' ORDER BY created_at LOOP
    base := public.slugify(coalesce(r.display_name, r.full_name, 'obituario'));
    IF base = '' THEN base := 'obituario'; END IF;
    candidate := base;
    counter := 1;
    WHILE EXISTS (SELECT 1 FROM public.obituaries WHERE funeraria_id = r.funeraria_id AND slug = candidate AND id <> r.id) LOOP
      counter := counter + 1;
      candidate := base || '-' || counter;
    END LOOP;
    UPDATE public.obituaries SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

-- Unique index per funeraria
CREATE UNIQUE INDEX IF NOT EXISTS obituaries_funeraria_slug_unique
  ON public.obituaries (funeraria_id, slug);
