-- Eliminar registo órfão do técnico de teste (sem user_id)
DELETE FROM public.technicians WHERE email = 'tecnico.teste@memoralis.pt' AND user_id IS NULL;