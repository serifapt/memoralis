-- Update care_plan_prices with Stripe price IDs
UPDATE public.care_plan_prices cpp
SET stripe_price_id = CASE 
  WHEN cp.code = 'ESSENTIAL' AND cpp.billing_period = 'monthly' THEN 'price_1SlWTWKRhaUcHz7XjYZ6MyDu'
  WHEN cp.code = 'ESSENTIAL' AND cpp.billing_period = 'annual' THEN 'price_1SlWV7KRhaUcHz7XO8rU7OqA'
  WHEN cp.code = 'HOMENAGEM' AND cpp.billing_period = 'monthly' THEN 'price_1SlWVOKRhaUcHz7XdRPvpym9'
  WHEN cp.code = 'HOMENAGEM' AND cpp.billing_period = 'annual' THEN 'price_1SlWVvKRhaUcHz7XMFSYJiLt'
  WHEN cp.code = 'SERENIDADE' AND cpp.billing_period = 'monthly' THEN 'price_1SlWcTKRhaUcHz7XU8oWNijD'
  WHEN cp.code = 'SERENIDADE' AND cpp.billing_period = 'annual' THEN 'price_1SlqH8KRhaUcHz7XmY4hgZol'
  WHEN cp.code = 'ETERNO' AND cpp.billing_period = 'monthly' THEN 'price_1SlqL6KRhaUcHz7XunhPeezd'
  WHEN cp.code = 'ETERNO' AND cpp.billing_period = 'annual' THEN 'price_1SlqOAKRhaUcHz7XMqs2vtjc'
  END
FROM public.care_plans cp
WHERE cpp.care_plan_id = cp.id;