-- Create table for funeraria general documents
CREATE TABLE public.funeraria_general_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funeraria_general_docs ENABLE ROW LEVEL SECURITY;

-- Policies for funerarias to manage their own documents
CREATE POLICY "Funerarias can view own general documents"
ON public.funeraria_general_docs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = funeraria_general_docs.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can insert own general documents"
ON public.funeraria_general_docs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = funeraria_general_docs.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can update own general documents"
ON public.funeraria_general_docs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = funeraria_general_docs.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can delete own general documents"
ON public.funeraria_general_docs
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = funeraria_general_docs.funeraria_id
  AND funerarias.user_id = auth.uid()
));

-- Create storage bucket for general documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('funeraria-general-docs', 'funeraria-general-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Funerarias can upload own general docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'funeraria-general-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Funerarias can view own general docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'funeraria-general-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Funerarias can delete own general docs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'funeraria-general-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger for updated_at
CREATE TRIGGER update_funeraria_general_docs_updated_at
BEFORE UPDATE ON public.funeraria_general_docs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();