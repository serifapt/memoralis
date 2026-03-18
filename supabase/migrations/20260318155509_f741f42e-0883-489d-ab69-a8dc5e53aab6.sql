
ALTER TABLE public.funerarias
ADD COLUMN IF NOT EXISTS descricao text,
ADD COLUMN IF NOT EXISTS servicos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS telefone_secundario text,
ADD COLUMN IF NOT EXISTS horario text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS localidade text,
ADD COLUMN IF NOT EXISTS codigo_postal text,
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS pagina_publica_visivel boolean DEFAULT false;

CREATE POLICY "Public can view visible funerarias"
ON public.funerarias FOR SELECT
TO anon, authenticated
USING (pagina_publica_visivel = true);
