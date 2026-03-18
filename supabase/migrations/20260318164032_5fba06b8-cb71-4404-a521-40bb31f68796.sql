-- Testimonials table for public funeral home pages
CREATE TABLE public.funeraria_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funeraria_testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a testimonial
CREATE POLICY "Anyone can submit testimonials"
  ON public.funeraria_testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can view approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON public.funeraria_testimonials FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Funeraria owners can view all their testimonials (for moderation)
CREATE POLICY "Funeraria owners can view own testimonials"
  ON public.funeraria_testimonials FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = funeraria_testimonials.funeraria_id
    AND funerarias.user_id = auth.uid()
  ));

-- Funeraria owners can update (approve/reject) their testimonials
CREATE POLICY "Funeraria owners can update own testimonials"
  ON public.funeraria_testimonials FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = funeraria_testimonials.funeraria_id
    AND funerarias.user_id = auth.uid()
  ));

-- Funeraria owners can delete their testimonials
CREATE POLICY "Funeraria owners can delete own testimonials"
  ON public.funeraria_testimonials FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM funerarias
    WHERE funerarias.id = funeraria_testimonials.funeraria_id
    AND funerarias.user_id = auth.uid()
  ));