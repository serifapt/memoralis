
ALTER TABLE public.funerarias ADD COLUMN IF NOT EXISTS logo_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('funeraria-logos', 'funeraria-logos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'funeraria-logos');
CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'funeraria-logos');
CREATE POLICY "Users can update own logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'funeraria-logos');
CREATE POLICY "Users can delete own logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'funeraria-logos');
