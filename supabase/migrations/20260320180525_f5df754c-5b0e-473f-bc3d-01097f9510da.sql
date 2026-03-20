ALTER TABLE public.obituaries
  ADD CONSTRAINT obituaries_funeraria_id_fkey
  FOREIGN KEY (funeraria_id)
  REFERENCES public.funerarias(id);