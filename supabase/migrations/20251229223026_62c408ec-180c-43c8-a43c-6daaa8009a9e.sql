-- Corrigir search_path das funções criadas anteriormente
CREATE OR REPLACE FUNCTION public.generate_client_dedupe_key(
  p_nif TEXT,
  p_email TEXT,
  p_phone TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.set_client_dedupe_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.dedupe_key := public.generate_client_dedupe_key(NEW.nif, NEW.email, NEW.phone);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_recalc_line_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = OLD.section_id;
    PERFORM public.recalculate_quote_totals(v_quote_id);
    RETURN OLD;
  ELSE
    NEW.line_total := NEW.quantity * NEW.unit_price * (1 - COALESCE(NEW.discount_percent, 0) / 100);
    SELECT quote_id INTO v_quote_id FROM budget_quote_sections WHERE id = NEW.section_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_recalc_after_line_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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