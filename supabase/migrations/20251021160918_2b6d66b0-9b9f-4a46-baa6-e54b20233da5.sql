-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'funeraria');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create funerarias table
CREATE TABLE public.funerarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_comercial TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  responsavel_nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'rejeitado')),
  motivo_rejeicao TEXT,
  declaro_representacao_legal BOOLEAN NOT NULL DEFAULT false,
  aceito_termos BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funerarias ENABLE ROW LEVEL SECURITY;

-- Funerarias policies
CREATE POLICY "Users can view own funeraria"
  ON public.funerarias FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funeraria"
  ON public.funerarias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funeraria"
  ON public.funerarias FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all funerarias"
  ON public.funerarias FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all funerarias"
  ON public.funerarias FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create funeraria_docs table
CREATE TABLE public.funeraria_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('licenca_atividade', 'certidao_permanente_upload', 'certidao_permanente_codigo', 'inicio_atividade_at')),
  ficheiro_path TEXT,
  codigo_acesso TEXT,
  numero_documento TEXT,
  entidade_emissora TEXT,
  data_emissao DATE,
  data_validade DATE,
  estado_validacao TEXT NOT NULL DEFAULT 'por_validar' CHECK (estado_validacao IN ('por_validar', 'valido', 'invalido')),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funeraria_docs ENABLE ROW LEVEL SECURITY;

-- Funeraria docs policies
CREATE POLICY "Users can view own docs"
  ON public.funeraria_docs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funerarias
      WHERE funerarias.id = funeraria_docs.funeraria_id
        AND funerarias.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own docs"
  ON public.funeraria_docs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.funerarias
      WHERE funerarias.id = funeraria_docs.funeraria_id
        AND funerarias.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all docs"
  ON public.funeraria_docs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all docs"
  ON public.funeraria_docs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  acao TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'funeraria-docs',
  'funeraria-docs',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Storage policies for funeraria documents
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'funeraria-docs' AND
    EXISTS (
      SELECT 1 FROM public.funerarias
      WHERE funerarias.user_id = auth.uid()
        AND (storage.foldername(name))[1] = funerarias.id::text
    )
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'funeraria-docs' AND
    EXISTS (
      SELECT 1 FROM public.funerarias
      WHERE funerarias.user_id = auth.uid()
        AND (storage.foldername(name))[1] = funerarias.id::text
    )
  );

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'funeraria-docs' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_funerarias_updated_at
  BEFORE UPDATE ON public.funerarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funeraria_docs_updated_at
  BEFORE UPDATE ON public.funeraria_docs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();