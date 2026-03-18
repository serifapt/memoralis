

# Plano: Tornar o Dashboard e Website Público Funcionais com Dados Reais

## Resumo do Estado Atual

Após análise do código, identifico **4 áreas principais** com dados mock que precisam ser ligadas à base de dados:

### O que JA funciona:
- Criar/Editar obituários (com foto, cerimónias, documentos, cliente responsável)
- Listagem de obituários no backoffice
- Calendário de cerimónias (backoffice)
- Gestão de clientes
- Gestão de documentos gerais
- Orçamentos
- Catálogo de flores + pedidos
- Chat de suporte
- Autenticação funerária

### O que precisa ser corrigido (4 ficheiros):

---

## 1. Dashboard (`Dashboard.tsx`) — Dados reais do Supabase

O Dashboard inteiro usa arrays mock hardcoded. Refatorar para:

- **Stats** — queries reais:
  - "Processos Ativos" → `count` de `obituaries` com `is_completed = false`
  - "Cerimónias Agendadas" → `count` de `ceremony_events` nos próximos 7 dias
  - "Processos Concluídos" → `count` de `obituaries` com `is_completed = true`
  - "Este mês" → contagem filtrada pelo mês atual

- **Obituários Recentes** → últimos 5 obituários da funerária, com `ceremony_events` associados

- **Próximas Cerimónias** → próximas 5 ceremony_events (futuras), com nome do obituário

- **Processos Ativos** → obituários não concluídos, com indicador de progresso baseado nos campos preenchidos

- **Processos Concluídos** → últimos obituários concluídos com `service_price`

- **Nome da funerária** no header → buscar `nome_comercial` da tabela `funerarias`

- **Pesquisa rápida** → navegar para `/obituaries?search=...`

- Botões "Ver Todos" → navegar para as páginas respetivas

---

## 2. Página Pública de Obituário (`ObituaryDetail.tsx`) — Dados reais

Atualmente 100% mock. Refatorar para:

- Buscar obituário real por `id` da URL (já existe `is_public = true AND is_completed = true` RLS policy)
- Mostrar: `display_name`, `birth_date`, `death_date`, `locality`, `photo_url`, `public_message`
- Buscar `ceremony_events` reais para o obituário
- Buscar dados da funerária (nome, telefone, morada) via `funeraria_id` do obituário
- Buscar obituários relacionados (outros da mesma funerária que são públicos)
- Condolências: manter o formulário visual mas sem funcionalidade por agora (não existe tabela de condolências)
- `SendFlowersModal`: passar dados reais (`obituaryId`, `funerariaId`)

---

## 3. Arquivo Público de Obituários (`ObituaryArchive.tsx`) — Dados reais

Atualmente usa `mockObituaries` hardcoded. Refatorar para:

- Buscar obituários públicos (`is_public = true AND is_completed = true`) do Supabase
- Pesquisa funcional por nome
- Filtros de localidade baseados nos dados reais
- Links corretos para `/obituario/{uuid}`
- Mostrar foto real se existir (`photo_url`)
- Paginação real (load more com offset)

---

## 4. Settings — Tab Empresa (`Settings.tsx`) — Ligar ao Supabase

O tab "Empresa" tem campos vazios sem ligação. Refatorar para:

- Carregar dados de `funerarias` (nome_comercial, nif, telefone) no mount
- Guardar alterações ao clicar "Guardar Alterações" via `.update()` na tabela `funerarias`
- A tabela `funerarias` não tem campos `address` ou `email` — **serão necessários novos campos** via migration

### Migration necessária:
```sql
ALTER TABLE public.funerarias 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS morada text;
```

---

## Ordem de implementação

1. **Dashboard** — impacto visual imediato, é a primeira página que o cliente vê
2. **ObituaryDetail** — liga o backoffice ao website público (quando a funerária publica, o público vê)
3. **ObituaryArchive** — listagem pública funcional
4. **Settings** — dados da empresa editáveis

## Notas técnicas

- Todas as queries filtram pela `funeraria_id` do user autenticado (padrão já existente)
- As RLS policies já existem para todos os acessos necessários
- Não é necessário criar novas tabelas (exceto 2 colunas na `funerarias`)
- O padrão de fetch usado será consistente com o resto do código (useState + useEffect + supabase client)

