

## Plano: Gestão admin de dados da funerária

### Contexto
A página `AdminFunerariaDetail` é read-only. O admin precisa de editar dados da funerária, credenciais de acesso e validar documentação.

### Alterações

**1. Nova Edge Function `admin-update-funeraria/index.ts`**
- Verifica que o caller tem role `admin` (platform admin)
- Aceita: `funeraria_id`, `email`, `password`, `responsavel_nome`, `telefone`, `nome_comercial`, `nif`, `status`
- Atualiza credenciais auth via `admin.updateUserById` (email/password do `user_id` da funerária)
- Atualiza campos da tabela `funerarias` (nome_comercial, nif, responsavel_nome, telefone)
- Regista alterações em `audit_logs`

**2. Atualizar `AdminFunerariaDetail.tsx`**
- Adicionar secção "Editar Dados" com formulário inline (campos editáveis para nome comercial, NIF, responsável, telefone)
- Adicionar secção "Credenciais de Acesso" com campos para email e nova password (chama a edge function)
- Nos documentos, adicionar botões para o admin poder marcar cada documento como "válido" diretamente (update `funeraria_docs.estado_validacao`)
- Buscar e mostrar o email atual do utilizador via `get-member-emails` (já existe)
- Todos os campos editáveis com botão "Guardar" por secção

**3. Validação de documentos pelo admin**
- Em cada documento, adicionar botão "Validar" que marca `estado_validacao = 'valido'`
- Já existe RLS policy para admins atualizarem `funeraria_docs`

### Ficheiros a criar/editar
- **Criar**: `supabase/functions/admin-update-funeraria/index.ts`
- **Editar**: `src/pages/AdminFunerariaDetail.tsx`

### Sem alterações de base de dados
Usa tabelas e RLS existentes. A edge function usa service role para atualizar auth.

