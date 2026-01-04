-- Create test memorial location
INSERT INTO public.memorial_locations (customer_id, cemetery_name, cemetery_address, section, grave_number, notes)
VALUES (
  'a3e7091c-9670-4842-8239-11419752b2f7',
  'Cemitério dos Prazeres',
  'Praça São João Bosco, 1300-526 Lisboa',
  'Secção B',
  'Jazigo 42',
  'Jazigo familiar com 4 gavetas'
);

-- Create test subscription (Homenagem plan - monthly)
INSERT INTO public.care_subscriptions (
  customer_id,
  care_plan_id,
  memorial_location_id,
  billing_period,
  status,
  current_period_end
)
SELECT 
  'a3e7091c-9670-4842-8239-11419752b2f7',
  '7983c220-cd52-4fb0-9db3-eb9390837144',
  ml.id,
  'monthly',
  'active',
  (now() + interval '30 days')::timestamp with time zone
FROM memorial_locations ml
WHERE ml.customer_id = 'a3e7091c-9670-4842-8239-11419752b2f7'
LIMIT 1;