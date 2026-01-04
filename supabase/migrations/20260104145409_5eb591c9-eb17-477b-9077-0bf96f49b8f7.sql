-- Criar utilizador admin diretamente via função existente
-- Primeiro verificar se a função existe e funciona
SELECT public.create_admin_user(
  'admin@memoralis.pt',
  'Administrador Memoralis',
  'AdminMemoralis2024!'
);