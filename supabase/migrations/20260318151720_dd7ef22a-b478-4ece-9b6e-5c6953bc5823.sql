
INSERT INTO storage.buckets (id, name, public) VALUES ('obituary-photos', 'obituary-photos', true);

CREATE POLICY "Authenticated users can upload obituary photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'obituary-photos');

CREATE POLICY "Anyone can view obituary photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'obituary-photos');

CREATE POLICY "Users can delete own obituary photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'obituary-photos');
