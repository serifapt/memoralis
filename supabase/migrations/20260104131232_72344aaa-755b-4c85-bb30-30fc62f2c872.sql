-- Allow technicians to exist without auth user (for testing)
-- First make user_id nullable
ALTER TABLE public.technicians ALTER COLUMN user_id DROP NOT NULL;

-- Now insert the test technician
INSERT INTO public.technicians (
  name,
  email,
  phone,
  regions,
  active
)
VALUES (
  'João Silva (Técnico Teste)',
  'tecnico.teste@memoralis.pt',
  '+351 912 345 678',
  ARRAY['Lisboa', 'Setúbal'],
  true
);