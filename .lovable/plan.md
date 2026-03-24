
Plano: confirmar e corrigir o fluxo completo de orçamentos

Diagnóstico confirmado
- O problema afecta tanto novo orçamento como orçamento existente.
- No backend há 0 registos em `budget_quotes` e `budget_quote_sections`, por isso o fluxo de criação não está a persistir nada.
- As políticas de acesso dos orçamentos existem, portanto o problema não parece ser falta de RLS aberta, mas sim falha no fluxo de gravação/estado.
- As funções de recálculo existem, mas os triggers do orçamento não estão activos na base de dados. Isso deixa os totais e subtotais inconsistentes.
- Em `BudgetQuoteDetail.tsx` há handlers que ficam silenciosamente sem efeito quando `quote` não está carregado, e outros que actualizam o estado local sem confirmar sucesso no backend.

O que vou corrigir

1. Tornar o editor robusto para novo e existente
- Em `src/pages/BudgetQuoteDetail.tsx`, bloquear acções dependentes de `quote` até o orçamento estar realmente carregado/criado.
- Mostrar estado de erro claro quando um orçamento existente não é encontrado ou não carrega.
- Deixar de ter botões que parecem activos mas não fazem nada.

2. Corrigir a gravação do orçamento
- Em `src/hooks/useBudgetQuotes.ts`, reforçar o fluxo de `createQuote` e `updateQuote` com validação explícita de:
  - sessão autenticada
  - funerária associada ao utilizador
  - cliente seleccionado
  - resposta válida do backend
- Se falhar, devolver erro utilizável pela UI, em vez de falhas silenciosas.
- Em `BudgetQuoteDetail.tsx`, só navegar/recarregar quando a gravação for mesmo bem-sucedida.

3. Corrigir secções e linhas
- Fazer com que `addSection`, `updateSection`, `deleteSection`, `addLine`, `updateLine` e `deleteLine` só alterem o estado local se a operação no backend tiver sucesso.
- Após operações estruturais, recarregar o orçamento do backend para manter UI, totais e PDF sincronizados.

4. Corrigir leitura de orçamento existente
- Trocar leituras críticas com risco de ausência de dados para `maybeSingle()` onde fizer sentido, em vez de `.single()`.
- Em particular, `getQuoteById` deve tratar “não encontrado” de forma explícita e visível na UI.

5. Reparar o backend do orçamento
- Criar uma migração para repor os triggers que estão em falta nas tabelas de orçamento:
  - cálculo automático de `line_total`
  - recálculo de subtotal por secção
  - recálculo de total do orçamento
- Isto garante que lista, detalhe e PDF usam valores persistidos correctos.

6. Confirmar o fluxo completo do módulo
- Rever e validar todos os pontos do orçamento:
  - criar orçamento novo
  - guardar
  - abrir orçamento existente
  - adicionar/editar/apagar secções
  - adicionar/editar/apagar linhas
  - recalcular totais
  - duplicar
  - alterar estado
  - converter orçamento aceite em processo de óbito
  - geração de PDF

Ficheiros a alterar
- `src/pages/BudgetQuoteDetail.tsx`
- `src/hooks/useBudgetQuotes.ts`
- `supabase/migrations/...` (nova migração para triggers do orçamento)

Detalhes técnicos
- Vou manter as políticas de acesso actuais e não abrir dados do orçamento.
- O foco será eliminar no-ops, falhas silenciosas e inconsistências entre estado local e estado persistido.
- Como hoje não há triggers activos, a confirmação “end-to-end” do orçamento exige corrigir frontend e backend em conjunto.
