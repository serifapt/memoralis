-- Create obituary_documents table for document uploads
CREATE TABLE IF NOT EXISTS public.obituary_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  is_required BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

-- Create document_templates table for certificate templates
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_category TEXT NOT NULL CHECK (template_category IN ('obrigatoria', 'complementar')),
  template_fields JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.obituary_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for obituary_documents
CREATE POLICY "Funerarias can view own obituary documents"
ON public.obituary_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_documents.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can insert own obituary documents"
ON public.obituary_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_documents.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can update own obituary documents"
ON public.obituary_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_documents.obituary_id
    AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Funerarias can delete own obituary documents"
ON public.obituary_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = obituary_documents.obituary_id
    AND f.user_id = auth.uid()
  )
);

-- RLS policies for document_templates (read-only for funerarias)
CREATE POLICY "Everyone can view active templates"
ON public.document_templates
FOR SELECT
USING (is_active = true);

-- Create storage bucket for obituary documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('obituary-documents', 'obituary-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for obituary documents
CREATE POLICY "Funerarias can upload own obituary documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'obituary-documents' AND
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE f.user_id = auth.uid()
    AND (storage.foldername(name))[1] = o.id::text
  )
);

CREATE POLICY "Funerarias can view own obituary documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'obituary-documents' AND
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE f.user_id = auth.uid()
    AND (storage.foldername(name))[1] = o.id::text
  )
);

CREATE POLICY "Funerarias can delete own obituary documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'obituary-documents' AND
  EXISTS (
    SELECT 1 FROM obituaries o
    JOIN funerarias f ON f.id = o.funeraria_id
    WHERE f.user_id = auth.uid()
    AND (storage.foldername(name))[1] = o.id::text
  )
);

-- Insert default document templates
INSERT INTO public.document_templates (template_name, template_category, template_fields) VALUES
('Certificado Médico de Óbito (CMO)', 'obrigatoria', '{"fields": ["data_emissao", "medico", "causa_morte", "local_morte"]}'),
('Registo/Assento de Óbito', 'obrigatoria', '{"fields": ["conservatoria", "data_registo", "numero_registo"]}'),
('Certidão de Óbito', 'obrigatoria', '{"fields": ["conservatoria", "data_emissao", "numero_certidao"]}'),
('Requisição de Inumação/Cremação', 'obrigatoria', '{"fields": ["cemiterio", "data_cerimonia", "tipo_cerimonia"]}'),
('Guias de Transporte', 'obrigatoria', '{"fields": ["origem", "destino", "data_transporte", "responsavel"]}'),
('Autorizações das Entidades', 'obrigatoria', '{"fields": ["entidade", "tipo_autorizacao", "data_autorizacao"]}'),
('Certidões para Segurança Social', 'complementar', '{"fields": ["numero_beneficiario", "tipo_pensao"]}'),
('Documentos para Finanças', 'complementar', '{"fields": ["nif", "tipo_documento"]}'),
('Processos Consulares', 'complementar', '{"fields": ["consulado", "tipo_processo", "numero_processo"]}'),
('Documentos de Seguros', 'complementar', '{"fields": ["seguradora", "numero_apolice", "tipo_seguro"]}'),
('Certificados Sanitários', 'complementar', '{"fields": ["autoridade_sanitaria", "data_emissao", "destino"]}')
ON CONFLICT DO NOTHING;