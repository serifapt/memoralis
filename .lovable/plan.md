

## Plano: Corrigir auto-preenchimento dos dados do óbito no orçamento

### Problema
O `useEffect` em `BudgetQuoteDetail.tsx` (linha 172) tem `getQuoteById` como dependência, mas esta função não está envolvida em `useCallback` no hook `useBudgetQuotes.ts` (linha 179). Isto causa re-execuções infinitas do efeito — cada render cria uma nova referência de `getQuoteById`, o efeito dispara novamente, e os dados preenchidos são potencialmente sobrepostos ou o componente re-renderiza antes de os mostrar.

### Alterações

#### 1. Memoizar `getQuoteById` em `useBudgetQuotes.ts`
Envolver a função `getQuoteById` (linha 179) com `useCallback` e dependência em `[toast]`, tal como já é feito com `fetchQuotes`.

#### 2. Remover `getQuoteById` das dependências do useEffect em `BudgetQuoteDetail.tsx`
Alternativamente (e mais seguro), remover `getQuoteById` da lista de dependências do `useEffect` na linha 172, uma vez que para o caso `isNew` esta função nem é usada, e para o caso de edição basta depender de `id`. Usar uma ref ou importar directamente.

**Abordagem escolhida**: Memoizar `getQuoteById` com `useCallback` no hook (solução limpa que corrige o problema na origem).

### Resultado
Os campos Nome do Falecido, Data Falecimento, Local Falecimento, Data Funeral e Cemitério serão correctamente preenchidos ao abrir `/budgets/new?obituaryId=X`, e o cliente será auto-seleccionado.

