
ALTER TABLE public.cemeteries ADD COLUMN IF NOT EXISTS freguesia text;
ALTER TABLE public.care_interest_leads ADD COLUMN IF NOT EXISTS freguesia text;
