

## Plano: Criar óbito automaticamente ao aceitar orçamento

### Situação atual
Já existe o fluxo de pré-preenchimento ao navegar para `/obituaries/new?fromQuoteId=X`. Atualmente, após marcar como "Aceite", o utilizador precisa clicar manualmente no botão "Criar Processo".

### Alteração
Após `updateQuoteStatus` com sucesso para `ACCEPTED`, navegar automaticamente para `/obituaries/new?fromQuoteId={quoteId}`, reutilizando toda a lógica de pré-preenchimento já existente.

### Ficheiros a editar

1. **`src/pages/BudgetQuoteDetail.tsx`** — No `handleStatusChange`, após sucesso com status `ACCEPTED`, fazer `navigate(/obituaries/new?fromQuoteId=${quote.id})`.

2. **`src/pages/BudgetQuotes.tsx`** — No handler de mudança de status na listagem (linha ~209), adicionar a mesma navegação automática quando o novo status é `ACCEPTED`.

Assim, o utilizador aceita o orçamento e é imediatamente levado ao formulário de novo óbito com todos os dados já preenchidos (falecido, cliente, cerimónia).

