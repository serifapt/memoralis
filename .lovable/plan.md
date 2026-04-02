

## Corrigir pedido de correção e enviar email à funerária

### Problema 1: Erro no carregamento de dados
A query `audit_logs` tenta fazer join com `profiles` (`audit_logs.actor_id → profiles.full_name`), mas não existe foreign key entre as tabelas. Isto causa erro ao carregar a página de detalhe.

**Correção em `src/pages/AdminFunerariaDetail.tsx`:**
- Remover o `.select("*, profiles(full_name)")` e usar `.select("*")` no query de `audit_logs`

### Problema 2: Enviar email ao pedir correção
Quando o admin clica "Enviar Pedido", deve enviar um email para o endereço de registo da funerária com os detalhes da correção solicitada.

**Passo 1: Criar edge function `notify-funeraria-correction`**
- Recebe `funeraria_id`, `document_type`, `motivo`
- Usa service role para buscar o email do `user_id` da funerária via `auth.admin.getUserById()`
- Envia email via `mailto:` link não é viável server-side — vamos usar a infraestrutura de email do Lovable (verificar se há domínio configurado) ou, em alternativa, guardar a notificação na base de dados e usar o sistema de notificações existente

**Abordagem escolhida — Edge Function com envio de email:**
1. Criar edge function `notify-funeraria-correction/index.ts` que:
   - Valida que o caller é admin
   - Busca o email do `user_id` da funerária via `auth.admin`
   - Envia email com o motivo da correção pedida
2. Chamar esta edge function no `handleRequestChanges` após sucesso do update

**Passo 2: Atualizar `handleRequestChanges` em `AdminFunerariaDetail.tsx`**
- Após atualizar o documento e criar o audit log, invocar a edge function para enviar o email
- Passar `funeraria_id`, tipo do documento, e motivo

### Ficheiros a criar/editar
- `supabase/functions/notify-funeraria-correction/index.ts` — nova edge function
- `src/pages/AdminFunerariaDetail.tsx` — corrigir query audit_logs + invocar edge function no handleRequestChanges

