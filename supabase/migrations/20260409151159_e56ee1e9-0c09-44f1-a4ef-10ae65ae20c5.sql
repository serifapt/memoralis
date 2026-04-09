ALTER TABLE public.funerarias DROP CONSTRAINT funerarias_status_check;
ALTER TABLE public.funerarias ADD CONSTRAINT funerarias_status_check 
  CHECK (status = ANY (ARRAY['pendente', 'ativo', 'rejeitado', 'desativado', 'correção_pendente']));