-- ====================================================
-- A) CUSTOMERS (B2C - separate from B2B clients)
-- ====================================================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  stripe_customer_id text UNIQUE,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own profile" ON public.customers
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile" ON public.customers
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Customers can insert own profile" ON public.customers
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all customers" ON public.customers
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all customers" ON public.customers
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- B) CARE_PLANS (seed manual)
-- ====================================================
CREATE TABLE public.care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  includes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active care plans" ON public.care_plans
FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage care plans" ON public.care_plans
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- C) CARE_PLAN_PRICES
-- ====================================================
CREATE TABLE public.care_plan_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  stripe_price_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (care_plan_id, billing_period)
);

ALTER TABLE public.care_plan_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active prices" ON public.care_plan_prices
FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage prices" ON public.care_plan_prices
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- D) MEMORIAL_LOCATIONS
-- ====================================================
CREATE TABLE public.memorial_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  obituary_id uuid REFERENCES public.obituaries(id) ON DELETE SET NULL,
  cemetery_name text NOT NULL,
  cemetery_address text,
  section text,
  grave_number text,
  reference_photos text[] DEFAULT '{}',
  notes text,
  special_dates jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.memorial_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own locations" ON public.memorial_locations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = memorial_locations.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can insert own locations" ON public.memorial_locations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = memorial_locations.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can update own locations" ON public.memorial_locations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = memorial_locations.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can delete own locations" ON public.memorial_locations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = memorial_locations.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all locations" ON public.memorial_locations
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- E) CARE_SUBSCRIPTIONS
-- ====================================================
CREATE TABLE public.care_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  memorial_location_id uuid NOT NULL REFERENCES public.memorial_locations(id) ON DELETE CASCADE,
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused')),
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  operational_pause boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.care_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own subscriptions" ON public.care_subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = care_subscriptions.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all subscriptions" ON public.care_subscriptions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- F) SERVICE_TASKS
-- ====================================================
CREATE TABLE public.service_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.care_subscriptions(id) ON DELETE CASCADE,
  scheduled_for date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'canceled')),
  assigned_to uuid REFERENCES auth.users(id),
  checklist_json jsonb DEFAULT '[]'::jsonb,
  technician_notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view assigned tasks" ON public.service_tasks
FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Technicians can update assigned tasks" ON public.service_tasks
FOR UPDATE USING (
  assigned_to = auth.uid() AND status != 'completed'
);

CREATE POLICY "Admins can manage all tasks" ON public.service_tasks
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view own tasks" ON public.service_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.care_subscriptions cs
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE cs.id = service_tasks.subscription_id
    AND c.user_id = auth.uid()
  )
);

-- ====================================================
-- G) SERVICE_TASK_MEDIA
-- ====================================================
CREATE TABLE public.service_task_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_task_id uuid NOT NULL REFERENCES public.service_tasks(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('before', 'after', 'other')),
  file_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_task_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage own task media" ON public.service_task_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.service_tasks st
    WHERE st.id = service_task_media.service_task_id
    AND st.assigned_to = auth.uid()
    AND st.status != 'completed'
  )
);

CREATE POLICY "Admins can manage all task media" ON public.service_task_media
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view own task media" ON public.service_task_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.service_tasks st
    JOIN public.care_subscriptions cs ON cs.id = st.subscription_id
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE st.id = service_task_media.service_task_id
    AND c.user_id = auth.uid()
  )
);

-- ====================================================
-- H) SERVICE_TASK_EXTRAS
-- ====================================================
CREATE TABLE public.service_task_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_task_id uuid NOT NULL REFERENCES public.service_tasks(id) ON DELETE CASCADE,
  sku text,
  name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  qty int NOT NULL DEFAULT 1,
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_task_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage own task extras" ON public.service_task_extras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.service_tasks st
    WHERE st.id = service_task_extras.service_task_id
    AND st.assigned_to = auth.uid()
    AND st.status != 'completed'
  )
);

CREATE POLICY "Admins can manage all task extras" ON public.service_task_extras
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view own task extras" ON public.service_task_extras
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.service_tasks st
    JOIN public.care_subscriptions cs ON cs.id = st.subscription_id
    JOIN public.customers c ON c.id = cs.customer_id
    WHERE st.id = service_task_extras.service_task_id
    AND c.user_id = auth.uid()
  )
);

-- ====================================================
-- I) WEBHOOK_EVENTS
-- ====================================================
CREATE TABLE public.care_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload_json jsonb NOT NULL
);

ALTER TABLE public.care_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access webhook events" ON public.care_webhook_events
FOR ALL USING (false);

-- ====================================================
-- J) SUPPORT_TICKETS
-- ====================================================
CREATE TABLE public.care_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.care_subscriptions(id),
  memorial_location_id uuid REFERENCES public.memorial_locations(id),
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.care_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own tickets" ON public.care_support_tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = care_support_tickets.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can create own tickets" ON public.care_support_tickets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = care_support_tickets.customer_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tickets" ON public.care_support_tickets
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- TECHNICIANS TABLE (for admin management)
-- ====================================================
CREATE TABLE public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  regions text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view own profile" ON public.technicians
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Technicians can update own profile" ON public.technicians
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage technicians" ON public.technicians
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ====================================================
-- STORAGE BUCKET FOR CARE MODULE
-- ====================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('care-media', 'care-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Technicians can upload care media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'care-media' AND
  public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Customers can upload reference photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'care-media' AND
  public.has_role(auth.uid(), 'customer')
);

CREATE POLICY "Public can view care media" ON storage.objects
FOR SELECT USING (bucket_id = 'care-media');

CREATE POLICY "Admins can manage care media" ON storage.objects
FOR ALL USING (
  bucket_id = 'care-media' AND
  public.has_role(auth.uid(), 'admin')
);

-- ====================================================
-- TRIGGERS for updated_at
-- ====================================================
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memorial_locations_updated_at
  BEFORE UPDATE ON public.memorial_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_subscriptions_updated_at
  BEFORE UPDATE ON public.care_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_tasks_updated_at
  BEFORE UPDATE ON public.service_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_support_tickets_updated_at
  BEFORE UPDATE ON public.care_support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
-- RLS for technician viewing assigned locations and subscriptions
-- ====================================================
CREATE POLICY "Technicians can view assigned locations" ON public.memorial_locations
FOR SELECT USING (
  public.has_role(auth.uid(), 'technician') AND
  EXISTS (
    SELECT 1 FROM public.care_subscriptions s
    JOIN public.service_tasks st ON st.subscription_id = s.id
    WHERE s.memorial_location_id = memorial_locations.id
    AND st.assigned_to = auth.uid()
  )
);

CREATE POLICY "Technicians can view assigned subscriptions" ON public.care_subscriptions
FOR SELECT USING (
  public.has_role(auth.uid(), 'technician') AND
  EXISTS (
    SELECT 1 FROM public.service_tasks st
    WHERE st.subscription_id = care_subscriptions.id
    AND st.assigned_to = auth.uid()
  )
);

-- ====================================================
-- SEED CARE PLANS
-- ====================================================
INSERT INTO public.care_plans (code, name, description, includes_json, display_order) VALUES
('ESSENTIAL', 'Essencial', 'Manutenção básica mensal para manter a campa limpa e cuidada.', 
 '["Limpeza mensal da campa", "Remoção de ervas e detritos", "Verificação do estado geral", "Relatório fotográfico"]'::jsonb, 1),
('HOMENAGEM', 'Homenagem', 'Cuidado completo com flores frescas e manutenção regular.',
 '["Tudo do plano Essencial", "Flores frescas mensais", "Limpeza de inscrições", "Polimento da pedra tumular"]'::jsonb, 2),
('SERENIDADE', 'Serenidade', 'Serviço premium com atenção especial em datas importantes.',
 '["Tudo do plano Homenagem", "Decoração em datas especiais", "Velas em aniversários", "Contacto prioritário"]'::jsonb, 3),
('ETERNO', 'Eterno', 'O mais completo cuidado perpétuo com todos os serviços incluídos.',
 '["Tudo do plano Serenidade", "Manutenção preventiva completa", "Restauro de pequenos danos", "Gestão de documentação", "Serviço de concierge"]'::jsonb, 4);

INSERT INTO public.care_plan_prices (care_plan_id, billing_period, amount, currency) 
SELECT id, 'monthly', 
  CASE code 
    WHEN 'ESSENTIAL' THEN 29.90
    WHEN 'HOMENAGEM' THEN 49.90
    WHEN 'SERENIDADE' THEN 79.90
    WHEN 'ETERNO' THEN 129.90
  END,
  'eur'
FROM public.care_plans;

INSERT INTO public.care_plan_prices (care_plan_id, billing_period, amount, currency) 
SELECT id, 'annual', 
  CASE code 
    WHEN 'ESSENTIAL' THEN 299.00
    WHEN 'HOMENAGEM' THEN 499.00
    WHEN 'SERENIDADE' THEN 799.00
    WHEN 'ETERNO' THEN 1299.00
  END,
  'eur'
FROM public.care_plans;