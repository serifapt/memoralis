-- Limpar utilizador inconsistente que ficou sem funerária associada
DELETE FROM public.user_roles WHERE user_id = '58248b28-a80f-43cc-b4b7-3ec074e056d4';
DELETE FROM public.profiles WHERE id = '58248b28-a80f-43cc-b4b7-3ec074e056d4';