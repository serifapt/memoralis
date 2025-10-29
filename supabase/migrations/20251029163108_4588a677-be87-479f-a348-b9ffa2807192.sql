-- Adicionar política de INSERT temporária para user_roles
-- Permite que usuários autenticados insiram suas próprias roles durante o registro
CREATE POLICY "Users can insert own role during registration"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Adicionar política que permite inserção de roles para novos usuários (mesmo antes de terem role)
CREATE POLICY "Allow role creation for new users"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Remover a política mais restritiva se existir
DROP POLICY IF EXISTS "Users can insert own role during registration" ON public.user_roles;