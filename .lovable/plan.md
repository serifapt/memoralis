

## Plano: Email de ativação, renomear /auth para /login, botões no header

### 1. Renomear rota `/auth` para `/login`

**Ficheiros a editar:**
- `src/App.tsx` — mudar `path="/auth"` para `path="/login"`
- `src/components/auth/ProtectedRoute.tsx` — mudar redirects de `/auth` para `/login`
- `src/pages/ForgotPassword.tsx` — mudar navegação para `/login`
- `src/pages/ResetPassword.tsx` — mudar navegação para `/login`
- `src/pages/FunerariaStatus.tsx` — mudar navegação para `/login`
- `src/pages/FunerariaRegister.tsx` — mudar navegação para `/login`
- `src/pages/AdminDashboard.tsx`, `AdminFunerarias.tsx`, `AdminUsers.tsx`, `AdminChat.tsx` — mudar navegação para `/login`

### 2. Atualizar botões do PublicHeader

**Ficheiro:** `src/components/layout/PublicHeader.tsx`
- Botão "Registar" → link para `/funeraria/register`
- Adicionar botão "Entrar" (variant outline) → link para `/login`
- No mobile (Sheet), adicionar ambos os botões

### 3. Enviar email de ativação após aprovação

Como não há domínio de email configurado, vou reutilizar a edge function `notify-funeraria-correction` expandindo-a, ou criar uma nova edge function dedicada.

**Abordagem:** Criar nova edge function `notify-funeraria-activation/index.ts`
- Recebe `funeraria_id`
- Valida admin
- Busca email do `user_id` da funerária via `auth.admin.getUserById()`
- Loga o email e dados (tal como a função de correção — email real será enviado quando domínio for configurado)

**Ficheiro:** `src/pages/AdminFunerariaDetail.tsx`
- No `handleApprove`, após sucesso do update, invocar `notify-funeraria-activation` com `funeraria_id`

### Ficheiros a criar/editar
- **Criar:** `supabase/functions/notify-funeraria-activation/index.ts`
- **Editar:** `src/App.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/components/layout/PublicHeader.tsx`, `src/pages/AdminFunerariaDetail.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`, `src/pages/FunerariaStatus.tsx`, `src/pages/FunerariaRegister.tsx`, `src/pages/AdminDashboard.tsx`, `src/pages/AdminFunerarias.tsx`, `src/pages/AdminUsers.tsx`, `src/pages/AdminChat.tsx`

