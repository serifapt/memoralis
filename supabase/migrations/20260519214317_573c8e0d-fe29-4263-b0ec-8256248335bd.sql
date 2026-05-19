
-- 1. funerarias: Stripe Connect
ALTER TABLE public.funerarias
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false;

-- 2. flower_orders: dados de pagamento e faturação
ALTER TABLE public.flower_orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount numeric,
  ADD COLUMN IF NOT EXISTS billing_nif text,
  ADD COLUMN IF NOT EXISTS billing_name text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS billing_postal_code text,
  ADD COLUMN IF NOT EXISTS billing_city text,
  ADD COLUMN IF NOT EXISTS billing_country text DEFAULT 'PT';

CREATE INDEX IF NOT EXISTS idx_flower_orders_checkout_session
  ON public.flower_orders(stripe_checkout_session_id);

-- 3. flower_webhook_events
CREATE TABLE IF NOT EXISTS public.flower_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  payload_json jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flower_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access flower webhook events"
  ON public.flower_webhook_events
  FOR ALL
  USING (false);

-- 4. platform_config
INSERT INTO public.platform_config (key, value) VALUES
  ('flowers_commission_percent', '10'),
  ('flowers_commission_min', '5'),
  ('flowers_refund_fee_retention_percent', '50')
ON CONFLICT (key) DO NOTHING;
