

## Plano: Contactos do formulário + Notificações no Dashboard

### 1. Criar tabela `funeraria_contacts` (migração)

```sql
CREATE TABLE public.funeraria_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funeraria_id UUID NOT NULL REFERENCES public.funerarias(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funeraria_contacts ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode submeter
CREATE POLICY "Anyone can submit contacts"
  ON public.funeraria_contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Donos da funerária podem ver, atualizar e apagar
CREATE POLICY "Funeraria owners can view own contacts"
  ON public.funeraria_contacts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

CREATE POLICY "Funeraria owners can update own contacts"
  ON public.funeraria_contacts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

CREATE POLICY "Funeraria owners can delete own contacts"
  ON public.funeraria_contacts FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM funerarias WHERE funerarias.id = funeraria_contacts.funeraria_id AND funerarias.user_id = auth.uid()));

-- Ativar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.funeraria_contacts;
```

### 2. Ligar o formulário público ao backend

**Ficheiro:** `src/pages/FunerariaDetail.tsx`

- Adicionar state para os campos do formulário (nome, contacto, email, mensagem) e loading/success
- No `onSubmit`, fazer `supabase.from("funeraria_contacts").insert(...)` com o `funeraria_id`
- Mostrar toast de sucesso/erro

### 3. Criar componente de notificações (sino)

**Ficheiro novo:** `src/components/layout/NotificationBell.tsx`

- Ícone `Bell` do lucide-react no header do dashboard
- Badge vermelho com contagem de contactos não lidos (`is_read = false`)
- Dropdown/popover ao clicar, mostrando os últimos contactos não lidos (nome, mensagem truncada, data)
- Clicar numa notificação marca como lida (`is_read = true`)
- Subscrição realtime para atualizar em tempo real quando chega novo contacto

### 4. Adicionar card "Contactos Recentes" ao Dashboard

**Ficheiro:** `src/pages/Dashboard.tsx`

- Novo card draggable "Contactos Recentes" com ícone `Mail`
- Lista os últimos 5 contactos recebidos (nome, email, mensagem truncada, data)
- Badge "Novo" para contactos não lidos
- Clicar abre detalhes ou marca como lido
- Adicionado ao `cardOrder` e ao objeto `cards`
- Query na `loadDashboardData` para carregar os contactos

### 5. Integrar o sino no layout

**Ficheiro:** `src/components/layout/Sidebar.tsx` ou `src/pages/Dashboard.tsx`

- Colocar o `NotificationBell` no header do dashboard, ao lado do botão "Novo Obituário"
- Recebe `funerariaId` como prop para filtrar notificações

### Ficheiros a criar/editar

| Ficheiro | Ação |
|---|---|
| Migração SQL | Criar tabela `funeraria_contacts` |
| `src/pages/FunerariaDetail.tsx` | Ligar form ao backend |
| `src/components/layout/NotificationBell.tsx` | Novo - sino com dropdown |
| `src/pages/Dashboard.tsx` | Card de contactos + integrar sino |

