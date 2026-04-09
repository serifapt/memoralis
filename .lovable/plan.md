

## Corrigir botão "Criar Óbito" → "Ver Óbito" no orçamento aceite

### Problema
Quando o utilizador aceita um orçamento, cria o óbito e volta à página do orçamento, o botão continua a mostrar "Criar Processo de Óbito" em vez de "Ver Processo de Óbito". Isto acontece porque o `useEffect` que carrega os dados do orçamento depende de `[id, isNew, obituaryId]` — ao voltar à mesma página, o `id` não muda e o efeito não volta a executar, logo o `obituary_id` atualizado na BD não é refletido no estado local.

### Solução

No ficheiro `src/pages/BudgetQuoteDetail.tsx`:

1. **Forçar recarga ao montar o componente** — adicionar um mecanismo para que, ao navegar de volta à página do orçamento, os dados sejam recarregados da BD. A forma mais simples é usar uma chave de recarga ou garantir que o `useEffect` de carregamento corre sempre que o componente monta (usando `useRef` ou adicionando uma dependência que muda na navegação).

2. **Alternativa mais robusta**: no `useEffect` de carregamento (linha 159), remover a cache local e usar um padrão que garanta a recarga. Concretamente, mover a lógica de carregamento para fora do `useEffect` numa função `loadData` e chamá-la tanto no mount como quando necessário.

Na prática, o `useEffect` já tem `loadData` definido dentro — o problema é que não volta a correr. A correção é adicionar uma dependência que mude ao reentrar na página, como usar o `location.key` do React Router.

### Ficheiro a alterar
- `src/pages/BudgetQuoteDetail.tsx` — adicionar `location.key` ou similar como dependência do `useEffect` de carregamento para forçar recarga ao reentrar na página

