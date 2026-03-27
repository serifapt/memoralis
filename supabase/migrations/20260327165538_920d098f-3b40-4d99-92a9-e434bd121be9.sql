
-- Table: obituary_views
CREATE TABLE public.obituary_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  viewer_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.obituary_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON public.obituary_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read views" ON public.obituary_views FOR SELECT TO anon, authenticated USING (true);

-- Table: obituary_candles
CREATE TABLE public.obituary_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  visitor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.obituary_candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can light candles" ON public.obituary_candles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read candles" ON public.obituary_candles FOR SELECT TO anon, authenticated USING (true);
