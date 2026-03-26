

## Plano: Renomear "Convidar" para "Adicionar" e permitir editar email/password

### 1. Renomear textos no MembersTab

**`src/components/settings/MembersTab.tsx`**:
- Botão: "Convidar Utilizador" → "Adicionar Utilizador"
- Título do formulário: "Convidar Novo Utilizador" → "Adicionar Novo Utilizador"
- Botão submit: "Convidar" → "Adicionar"
- Toast de sucesso: "convidado" → "adicionado"

### 2. Adicionar campos email e password ao diálogo de edição

**`src/components/settings/MembersTab.tsx`**:
- Adicionar campos "Email" e "Nova Password" ao diálogo de edição existente
- Email: campo editável, pré-preenchido com o email atual do membro
- Password: campo opcional (só altera se preenchido), com validação mínima (8 chars, maiúscula, minúscula, número)
- Mostrar email na listagem de membros (abaixo do nome/telefone)

### 3. Edge Function para atualizar email/password

**`supabase/functions/update-funeraria-member/index.ts`** (nova):
- Recebe: `member_user_id`, `funeraria_id`, `email?`, `password?`, `full_name?`, `phone?`
- Valida que o caller é admin da funerária
- Usa `adminClient.auth.admin.updateUserById()` para alterar email e/ou password
- Atualiza `profiles` para nome e telefone
- Retorna sucesso

### 4. Carregar emails dos membros

**`src/components/settings/MembersTab.tsx`** — no `loadMembers`:
- Após carregar profiles, chamar uma edge function ou RPC para obter os emails dos utilizadores (já que `auth.users` não é acessível via client SDK)
- Alternativa: criar uma edge function `get-member-emails` que recebe os user_ids e retorna os emails (usando service role)

### Ficheiros
- `src/components/settings/MembersTab.tsx` — renomear textos + campos email/password no edit dialog
- `supabase/functions/update-funeraria-member/index.ts` — nova edge function para update de auth data
- `supabase/functions/invite-funeraria-member/index.ts` — renomear mensagem de resposta

