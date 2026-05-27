
-- ============================================================
-- 1) CEMETERIES
-- ============================================================
CREATE TABLE public.cemeteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  municipio text NOT NULL,
  morada text,
  lat numeric(10,6),
  lng numeric(10,6),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cemeteries TO anon;
GRANT SELECT ON public.cemeteries TO authenticated;
GRANT ALL ON public.cemeteries TO service_role;

ALTER TABLE public.cemeteries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active cemeteries"
ON public.cemeteries FOR SELECT
USING (ativo = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage cemeteries"
ON public.cemeteries FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cemeteries_updated_at
BEFORE UPDATE ON public.cemeteries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2) MEMORIAL_LOCATIONS — extra columns
-- ============================================================
ALTER TABLE public.memorial_locations
  ADD COLUMN IF NOT EXISTS cemetery_id uuid REFERENCES public.cemeteries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS names_on_grave text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS death_date date;

-- ============================================================
-- 3) CARE_SUBSCRIPTIONS — extra columns + status list
-- ============================================================
ALTER TABLE public.care_subscriptions
  ADD COLUMN IF NOT EXISTS commemorative_dates jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Replace status CHECK constraint with the new set
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  WHERE t.relname = 'care_subscriptions'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%status%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.care_subscriptions DROP CONSTRAINT %I', conname);
  END IF;
END$$;

ALTER TABLE public.care_subscriptions
  ADD CONSTRAINT care_subscriptions_status_check
  CHECK (status IN ('pending_payment','pending_activation','active','suspended','canceled','past_due','trialing','unpaid','paused','pending'));

-- ============================================================
-- 4) SERVICE_VISITS — registo de visitas realizadas
-- ============================================================
CREATE TABLE public.service_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.care_subscriptions(id) ON DELETE CASCADE,
  visit_date timestamptz NOT NULL,
  before_photo_url text,
  after_photo_url text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_visits TO authenticated;
GRANT ALL ON public.service_visits TO service_role;

ALTER TABLE public.service_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own visits"
ON public.service_visits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.care_subscriptions cs
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE cs.id = service_visits.subscription_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage visits"
ON public.service_visits FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_service_visits_subscription ON public.service_visits(subscription_id);

-- ============================================================
-- 5) VISIT_REVIEWS — avaliações de visitas
-- ============================================================
CREATE TABLE public.visit_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL UNIQUE REFERENCES public.service_visits(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.visit_reviews TO authenticated;
GRANT ALL ON public.visit_reviews TO service_role;

ALTER TABLE public.visit_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own reviews"
ON public.visit_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_visits sv
    JOIN public.care_subscriptions cs ON cs.id = sv.subscription_id
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE sv.id = visit_reviews.visit_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can insert review for own visit"
ON public.visit_reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_visits sv
    JOIN public.care_subscriptions cs ON cs.id = sv.subscription_id
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE sv.id = visit_reviews.visit_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins view all reviews"
ON public.visit_reviews FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 6) SEED — care_plans (4 novos planos)
-- ============================================================
-- Limpar dados anteriores de planos (idempotente; só remove os com códigos antigos sem subscrições)
DELETE FROM public.care_plan_prices
  WHERE care_plan_id IN (SELECT id FROM public.care_plans);

DELETE FROM public.care_plans
  WHERE id NOT IN (SELECT DISTINCT care_plan_id FROM public.care_subscriptions);

INSERT INTO public.care_plans (code, name, description, includes_json, display_order, active) VALUES
('mensal', 'Mensal', '1 visita por mês', '["Limpeza geral da campa","2 composições de flores frescas da época (vaso e jarra)","1 círio branco/vermelho 60LL","Foto antes/depois"]'::jsonb, 1, true),
('quinzenal', 'Quinzenal', '2 visitas por mês', '["Limpeza geral da campa","2 composições de flores frescas da época (vaso e jarra)","1 círio branco/vermelho 60LL","Foto antes/depois"]'::jsonb, 2, true),
('semanal', 'Semanal', '4 visitas por mês', '["Limpeza geral da campa","2 composições de flores frescas da época (vaso e jarra)","1 círio branco/vermelho 60LL","Foto antes/depois"]'::jsonb, 3, true),
('premium', 'Premium', '4 visitas por mês + extras', '["Limpeza geral da campa + limpeza dos livros da campa","2 composições de flores frescas da época (vaso e jarra)","1 círio branco/vermelho 60LL","Foto antes/depois","3 datas comemorativas à escolha","Ramo especial em cada data comemorativa"]'::jsonb, 4, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  includes_json = EXCLUDED.includes_json,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;

INSERT INTO public.care_plan_prices (care_plan_id, billing_period, amount, currency, active)
SELECT id, 'monthly', CASE code
  WHEN 'mensal' THEN 50
  WHEN 'quinzenal' THEN 90
  WHEN 'semanal' THEN 160
  WHEN 'premium' THEN 200
END, 'eur', true
FROM public.care_plans
WHERE code IN ('mensal','quinzenal','semanal','premium');

-- ============================================================
-- 7) SEED — cemeteries
-- ============================================================
INSERT INTO public.cemeteries (nome, municipio, morada, lat, lng, ativo) VALUES
('Cemitério do Alto de São João', 'Lisboa', 'R. do Cemitério do Alto de São João, Lisboa', 38.7289, -9.1219, true),
('Cemitério dos Prazeres', 'Lisboa', 'R. do Século, Lisboa', 38.7136, -9.1715, true),
('Cemitério do Lumiar', 'Lisboa', 'R. do Lumiar, Lisboa', 38.7700, -9.1600, true),
('Cemitério de Benfica', 'Lisboa', 'Estrada de Benfica, Lisboa', 38.7480, -9.2010, true);
