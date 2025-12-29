-- Add flower service flag to funerarias
ALTER TABLE public.funerarias 
ADD COLUMN servico_flores_ativo boolean NOT NULL DEFAULT false;

-- Create flower_products table
CREATE TABLE public.flower_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funeraria_id uuid NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_description text,
  full_description text,
  price numeric NOT NULL CHECK (price > 0),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create flower_orders table
CREATE TABLE public.flower_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  funeraria_id uuid NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_email text,
  sender_phone text,
  message text,
  observations text,
  subtotal numeric NOT NULL DEFAULT 0,
  commission_percent numeric NOT NULL DEFAULT 10,
  commission_value numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDENTE',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create flower_order_items table
CREATE TABLE public.flower_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.flower_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.flower_products(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  product_price_snapshot numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL
);

-- Create platform_config table
CREATE TABLE public.platform_config (
  key text NOT NULL PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default commission config
INSERT INTO public.platform_config (key, value) VALUES ('flower_commission_percent', '10');

-- Enable RLS on all new tables
ALTER TABLE public.flower_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flower_products
CREATE POLICY "Funerarias can view own flower products"
ON public.flower_products FOR SELECT
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_products.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can insert own flower products"
ON public.flower_products FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_products.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can update own flower products"
ON public.flower_products FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_products.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can delete own flower products"
ON public.flower_products FOR DELETE
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_products.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Public can view active flower products"
ON public.flower_products FOR SELECT
USING (is_active = true);

-- RLS Policies for flower_orders
CREATE POLICY "Funerarias can view own flower orders"
ON public.flower_orders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_orders.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Funerarias can update own flower orders"
ON public.flower_orders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM funerarias
  WHERE funerarias.id = flower_orders.funeraria_id
  AND funerarias.user_id = auth.uid()
));

CREATE POLICY "Anyone can create flower orders"
ON public.flower_orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all flower orders"
ON public.flower_orders FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for flower_order_items
CREATE POLICY "Funerarias can view own order items"
ON public.flower_order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM flower_orders fo
  JOIN funerarias f ON f.id = fo.funeraria_id
  WHERE fo.id = flower_order_items.order_id
  AND f.user_id = auth.uid()
));

CREATE POLICY "Anyone can insert order items"
ON public.flower_order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
ON public.flower_order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_config
CREATE POLICY "Everyone can read platform config"
ON public.platform_config FOR SELECT
USING (true);

CREATE POLICY "Admins can update platform config"
ON public.platform_config FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert platform config"
ON public.platform_config FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_flower_products_updated_at
BEFORE UPDATE ON public.flower_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flower_orders_updated_at
BEFORE UPDATE ON public.flower_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_config_updated_at
BEFORE UPDATE ON public.platform_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for flower product images
INSERT INTO storage.buckets (id, name, public) VALUES ('flower-products', 'flower-products', true);

-- Storage policies for flower-products bucket
CREATE POLICY "Funerarias can upload flower product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'flower-products' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view flower product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'flower-products');

CREATE POLICY "Funerarias can update own flower product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'flower-products' AND auth.uid() IS NOT NULL);

CREATE POLICY "Funerarias can delete own flower product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'flower-products' AND auth.uid() IS NOT NULL);