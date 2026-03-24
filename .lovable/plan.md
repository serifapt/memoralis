
Problema identificado
- O bloqueio principal não está nos triggers nem no backend.
- Em `src/pages/BudgetQuoteDetail.tsx`, `const isNew = id === "new"` está errado para a rota atual.
- Em `/budgets/new`, `useParams()` não devolve `id`, por isso `id` é `undefined` e `isNew` fica `false`.
- Resultado:
  - a página entra em modo “editar”
  - `handleSave` não chama `createQuote` porque `isNew` é `false` e `quote` é `null`
  - `handleAddSection` faz `return` imediato porque `quote` é `null`
  - os botões parecem clicáveis mas não executam nada

Plano de correção

1. Corrigir a deteção “novo vs existente”
- Em `BudgetQuoteDetail.tsx`, substituir a lógica atual por uma deteção robusta:
  - `isNew = !id`, ou preferencialmente o mesmo padrão usado em `NewObituary.tsx`
  - `isEditing = !!id && uuidRegex.test(id)`
- Atualizar toda a página para usar esse estado correto:
  - carregamento inicial
  - título
  - botão Guardar
  - render das secções
  - botão Adicionar Secção

2. Corrigir os handlers que hoje ficam em no-op
- `handleSave`:
  - se for novo, cria sempre o orçamento
  - se for existente, atualiza
  - se houver estado inválido, mostra toast claro em vez de não fazer nada
- `handleAddSection`:
  - continua escondido até existir um `quote.id`
  - se for chamado sem orçamento carregado, mostra erro explícito

3. Alinhar com o padrão já usado no projeto
- Replicar em `BudgetQuoteDetail.tsx` a abordagem de `NewObituary.tsx`, que já distingue corretamente criação vs edição.
- Isto evita repetir o mesmo bug entre rotas `/budgets/new` e `/budgets/:id`.

4. Confirmar o fluxo completo após esta correção
- Rever rapidamente:
  - criar orçamento novo
  - guardar
  - navegação automática para `/budgets/:id`
  - mostrar “Adicionar Secção” só depois de existir orçamento
  - editar orçamento existente
  - adicionar secções e linhas
- A migração de triggers continua útil para totais, mas não é a causa deste bloqueio dos botões.

Ficheiro a alterar
- `src/pages/BudgetQuoteDetail.tsx`

Resultado esperado
- Em `/budgets/new`, o botão “Guardar” passa a criar o orçamento.
- Depois da criação, a página navega para o detalhe do orçamento.
- Só nessa fase aparece “Adicionar Secção”, e os restantes botões passam a atuar sobre um orçamento real.
