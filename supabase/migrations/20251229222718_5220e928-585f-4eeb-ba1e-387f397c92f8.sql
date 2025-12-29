-- ========================================================
-- 1) TABELA CLIENTS (Cliente unificado)
-- ========================================================
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship_degree TEXT,
  email TEXT,
  phone TEXT,
  nif TEXT,
  niss TEXT,
  nationality_place TEXT,
  iban TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  dedupe_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice único para evitar duplicados (funeraria + dedupe_key quando existe)
CREATE UNIQUE INDEX clients_dedupe_idx ON public.clients (funeraria_id, dedupe_key) WHERE dedupe_key IS NOT NULL;

-- Índices para performance
CREATE INDEX clients_funeraria_id_idx ON public.clients (funeraria_id);
CREATE INDEX clients_full_name_idx ON public.clients (full_name);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Funerarias can view own clients"
  ON public.clients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = clients.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = clients.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can update own clients"
  ON public.clients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = clients.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can delete own clients"
  ON public.clients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = clients.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

-- ========================================================
-- 2) ADICIONAR responsible_client_id AO OBITUARIES
-- ========================================================
ALTER TABLE public.obituaries 
ADD COLUMN responsible_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX obituaries_responsible_client_id_idx ON public.obituaries (responsible_client_id);

-- ========================================================
-- 3) TABELA BUDGET_QUOTE_SETTINGS (Configurações por funerária)
-- ========================================================
CREATE TABLE public.budget_quote_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL UNIQUE REFERENCES public.funerarias(id) ON DELETE CASCADE,
  next_quote_number INTEGER NOT NULL DEFAULT 1,
  default_validity_days INTEGER DEFAULT 30,
  default_footer_text TEXT DEFAULT 'Este orçamento é válido como contrato após assinatura.',
  default_vat_exempt BOOLEAN DEFAULT true,
  default_vat_reason_text TEXT DEFAULT 'Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_quote_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funerarias can view own settings"
  ON public.budget_quote_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quote_settings.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can insert own settings"
  ON public.budget_quote_settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quote_settings.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can update own settings"
  ON public.budget_quote_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quote_settings.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

-- ========================================================
-- 4) TABELA BUDGET_QUOTES (Orçamentos)
-- ========================================================
CREATE TYPE public.budget_quote_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'ARCHIVED');

CREATE TABLE public.budget_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  quote_number INTEGER NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.budget_quote_status NOT NULL DEFAULT 'DRAFT',
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  obituary_id UUID REFERENCES public.obituaries(id) ON DELETE SET NULL,
  
  -- Dados do falecido (snapshot ou puxados do óbito)
  deceased_name TEXT,
  death_date DATE,
  funeral_date DATE,
  cemetery TEXT,
  place_of_death TEXT,
  
  -- IVA
  vat_exempt BOOLEAN DEFAULT true,
  vat_exempt_reason_text TEXT DEFAULT 'Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA',
  
  -- Totais calculados
  subtotal NUMERIC(10, 2) DEFAULT 0,
  total_quote NUMERIC(10, 2) DEFAULT 0,
  
  -- Rodapé
  footer_text TEXT,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  last_sent_to_email TEXT,
  pdf_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(funeraria_id, quote_number)
);

CREATE INDEX budget_quotes_funeraria_id_idx ON public.budget_quotes (funeraria_id);
CREATE INDEX budget_quotes_client_id_idx ON public.budget_quotes (client_id);
CREATE INDEX budget_quotes_obituary_id_idx ON public.budget_quotes (obituary_id);
CREATE INDEX budget_quotes_status_idx ON public.budget_quotes (status);

ALTER TABLE public.budget_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funerarias can view own quotes"
  ON public.budget_quotes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quotes.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can insert own quotes"
  ON public.budget_quotes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quotes.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can update own quotes"
  ON public.budget_quotes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quotes.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can delete own quotes"
  ON public.budget_quotes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM funerarias 
    WHERE funerarias.id = budget_quotes.funeraria_id 
    AND funerarias.user_id = auth.uid()
  ));

-- ========================================================
-- 5) TABELA BUDGET_QUOTE_SECTIONS (Secções do orçamento)
-- ========================================================
CREATE TABLE public.budget_quote_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.budget_quotes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX budget_quote_sections_quote_id_idx ON public.budget_quote_sections (quote_id);

ALTER TABLE public.budget_quote_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funerarias can view own quote sections"
  ON public.budget_quote_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM budget_quotes bq
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bq.id = budget_quote_sections.quote_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can insert own quote sections"
  ON public.budget_quote_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM budget_quotes bq
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bq.id = budget_quote_sections.quote_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can update own quote sections"
  ON public.budget_quote_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM budget_quotes bq
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bq.id = budget_quote_sections.quote_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can delete own quote sections"
  ON public.budget_quote_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM budget_quotes bq
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bq.id = budget_quote_sections.quote_id 
    AND f.user_id = auth.uid()
  ));

-- ========================================================
-- 6) TABELA BUDGET_QUOTE_LINES (Linhas do orçamento)
-- ========================================================
CREATE TABLE public.budget_quote_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.budget_quote_sections(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  line_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX budget_quote_lines_section_id_idx ON public.budget_quote_lines (section_id);

ALTER TABLE public.budget_quote_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funerarias can view own quote lines"
  ON public.budget_quote_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM budget_quote_sections bqs
    JOIN budget_quotes bq ON bq.id = bqs.quote_id
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bqs.id = budget_quote_lines.section_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can insert own quote lines"
  ON public.budget_quote_lines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM budget_quote_sections bqs
    JOIN budget_quotes bq ON bq.id = bqs.quote_id
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bqs.id = budget_quote_lines.section_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can update own quote lines"
  ON public.budget_quote_lines FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM budget_quote_sections bqs
    JOIN budget_quotes bq ON bq.id = bqs.quote_id
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bqs.id = budget_quote_lines.section_id 
    AND f.user_id = auth.uid()
  ));

CREATE POLICY "Funerarias can delete own quote lines"
  ON public.budget_quote_lines FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM budget_quote_sections bqs
    JOIN budget_quotes bq ON bq.id = bqs.quote_id
    JOIN funerarias f ON f.id = bq.funeraria_id
    WHERE bqs.id = budget_quote_lines.section_id 
    AND f.user_id = auth.uid()
  ));

-- ========================================================
-- 7) FUNÇÃO PARA GERAR DEDUPE_KEY
-- ========================================================
CREATE OR REPLACE FUNCTION public.generate_client_dedupe_key(
  p_nif TEXT,
  p_email TEXT,
  p_phone TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Prioridade: nif > email > phone
  IF p_nif IS NOT NULL AND p_nif != '' THEN
    RETURN 'nif:' || lower(trim(regexp_replace(p_nif, '\s+', '', 'g')));
  ELSIF p_email IS NOT NULL AND p_email != '' THEN
    RETURN 'email:' || lower(trim(p_email));
  ELSIF p_phone IS NOT NULL AND p_phone != '' THEN
    RETURN 'phone:' || lower(trim(regexp_replace(p_phone, '\s+', '', 'g')));
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- ========================================================
-- 8) TRIGGER PARA AUTO-GERAR DEDUPE_KEY
-- ========================================================
CREATE OR REPLACE FUNCTION public.set_client_dedupe_key()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.dedupe_key := public.generate_client_dedupe_key(NEW.nif, NEW.email, NEW.phone);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_dedupe_key_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_dedupe_key();

-- ========================================================
-- 9) FUNÇÃO PARA OBTER PRÓXIMO NÚMERO DE ORÇAMENTO
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_next_quote_number(p_funeraria_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  -- Inserir settings se não existir
  INSERT INTO budget_quote_settings (funeraria_id)
  VALUES (p_funeraria_id)
  ON CONFLICT (funeraria_id) DO NOTHING;
  
  -- Obter e incrementar
  UPDATE budget_quote_settings
  SET next_quote_number = next_quote_number + 1,
      updated_at = now()
  WHERE funeraria_id = p_funeraria_id
  RETURNING next_quote_number - 1 INTO v_next_number;
  
  RETURN v_next_number;
END;
$$;

-- ========================================================
-- 10) FUNÇÃO PARA RECALCULAR TOTAIS DO ORÇAMENTO
-- ========================================================
CREATE OR REPLACE FUNCTION public.recalculate_quote_totals(p_quote_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total NUMERIC(10, 2);
BEGIN
  -- Recalcular subtotais das secções
  UPDATE budget_quote_sections bqs
  SET subtotal = COALESCE((
    SELECT SUM(line_total) 
    FROM budget_quote_lines bql 
    WHERE bql.section_id = bqs.id
  ), 0)
  WHERE bqs.quote_id = p_quote_id;
  
  -- Recalcular total do orçamento
  SELECT COALESCE(SUM(subtotal), 0) INTO v_total
  FROM budget_quote_sections
  WHERE quote_id = p_quote_id;
  
  UPDATE budget_quotes
  SET subtotal = v_total,
      total_quote = v_total,
      updated_at = now()
  WHERE id = p_quote_id;
END;
$$;

-- ========================================================
-- 11) TRIGGER PARA RECALCULAR TOTAIS AO ALTERAR LINHAS
-- ========================================================
CREATE OR REPLACE FUNCTION public.trigger_recalc_line_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_quote_id UUID;
BEGIN
  -- Calcular line_total
  IF TG_OP = 'DELETE' THEN
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = OLD.section_id;
    PERFORM public.recalculate_quote_totals(v_quote_id);
    RETURN OLD;
  ELSE
    NEW.line_total := NEW.quantity * NEW.unit_price * (1 - COALESCE(NEW.discount_percent, 0) / 100);
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = NEW.section_id;
    -- Recalcular após commit (defer)
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER budget_quote_lines_calc_trigger
  BEFORE INSERT OR UPDATE ON public.budget_quote_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalc_line_total();

-- Trigger para recalcular totais após mudanças
CREATE OR REPLACE FUNCTION public.trigger_recalc_after_line_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_quote_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = OLD.section_id;
  ELSE
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = NEW.section_id;
  END IF;
  
  PERFORM public.recalculate_quote_totals(v_quote_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER budget_quote_lines_recalc_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_quote_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalc_after_line_change();