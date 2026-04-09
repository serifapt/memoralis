
-- Allow platform admins to delete funerarias
CREATE POLICY "Admins can delete funerarias"
ON public.funerarias
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow platform admins to delete funeraria_docs
CREATE POLICY "Admins can delete all docs"
ON public.funeraria_docs
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
