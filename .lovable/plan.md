

## Plano: Gestão de utilizadores da funerária com roles (Admin/Editor)

### Conceito

Cada funerária poderá ter múltiplos utilizadores. O utilizador que registou a funerária é automaticamente "admin_funeraria". Pode convidar outros utilizadores como "admin_funeraria" ou "editor_funeraria". 

**Permissões:**
- **Admin** — acesso total (configurações, orçamentos, tudo)
- **Editor** — sem acesso a Configurações nem a Orçamentos

### Alterações

#### 1. Base de dados (migração)

Criar tabela `funeraria_members`:

```sql
CREATE TABLE public.funeraria_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funeraria_id uuid NOT NULL REFERENCES funerarias(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funeraria_id, user_id)
);

ALTER TABLE funeraria_members ENABLE ROW LEVEL SECURITY;
```

RLS policies: admins da funerária podem CRUD, editores podem SELECT.

Criar função `get_funeraria_member_role(user_id, funeraria_id)` SECURITY DEFINER para verificar role sem recursão.

Seed: inserir automaticamente o `user_id` do owner existente em cada funerária como `admin` via migração.

#### 2. Edge Function `invite-funeraria-member`

- Recebe email, role, funeraria_id
- Verifica que o caller é admin da funerária
- Cria conta auth (ou encontra existente)
- Atribui role `funeraria` na `user_roles` (se ainda não tem)
- Insere na `funeraria_members`

#### 3. Hook `useFunerariaRole`

Novo hook que retorna o role do utilizador atual na funerária (`admin` | `editor` | null`). Usado para controlar acessos no frontend.

#### 4. Sidebar (`src/components/layout/Sidebar.tsx`)

- Importar `useFunerariaRole`
- Se role === `editor`: esconder "Orçamentos" e "Configurações" do menu

#### 5. Settings (`src/pages/Settings.tsx`)

- Tab "Utilizadores" (já existe placeholder na linha 379-388): implementar a listagem de membros da funerária, com possibilidade de convidar novos e remover existentes
- Proteger a página inteira: se editor, redirecionar para /dashboard
- Apenas admins vêem o formulário de convite

#### 6. Protecção de rotas de orçamentos

- Em `BudgetQuotes.tsx` e `BudgetQuoteDetail.tsx`: verificar role e redirecionar editores para /dashboard

#### 7. ProtectedRoute update

- Atualizar o `ProtectedRoute` para também verificar `funeraria_members` quando role é `funeraria`, permitindo que membros acedam ao dashboard da funerária

### Ficheiros

- **Migração SQL** — tabela `funeraria_members`, RLS, função, seed dos owners existentes
- **Edge Function** — `supabase/functions/invite-funeraria-member/index.ts`
- **Novo hook** — `src/hooks/useFunerariaRole.ts`
- **Sidebar** — `src/components/layout/Sidebar.tsx`
- **Settings** — `src/pages/Settings.tsx` (tab Utilizadores + protecção)
- **BudgetQuotes** — `src/pages/BudgetQuotes.tsx` (protecção)
- **BudgetQuoteDetail** — `src/pages/BudgetQuoteDetail.tsx` (protecção)
- **ProtectedRoute** — `src/components/auth/ProtectedRoute.tsx` (aceitar membros)

