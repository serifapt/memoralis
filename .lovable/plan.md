

## Corrigir integração Orçamento ↔ Óbito após aceitação

### Problema
Quando um orçamento é aceite e cria automaticamente um óbito, o `obituary_id` é gravado no orçamento. No entanto, na ficha do óbito, o botão continua a mostrar opções para criar novos orçamentos mesmo quando já existe um orçamento aceite vinculado. Deveria apenas permitir ver o orçamento existente.

### Verificação atual
O código em `NewObituary.tsx` (linha ~2800) já distingue entre 0 quotes (mostra "Criar Orçamento"), 1 quote (mostra "Ver Orçamento") e múltiplos (mostra popover). A `fetchLinkedQuotes` busca todos os `budget_quotes` com `obituary_id` igual ao óbito.

### O que já funciona
- Ao marcar como ACCEPTED, navega para `/obituaries/new?fromQuoteId=...`
- O `NewObituary.tsx` preenche os dados do orçamento e, ao gravar, atualiza `budget_quotes.obituary_id`

### O que precisa de ser corrigido

#### 1. Na ficha do óbito: Bloquear criação de novos orçamentos quando há orçamento aceite
No ficheiro `src/pages/NewObituary.tsx`, na zona do botão de orçamento (~linha 2798-2840):
- Verificar se existe algum `linkedQuote` com status `ACCEPTED`
- Se sim, mostrar apenas o botão "Ver Orçamento" (sem opção de criar novo)
- Se existem múltiplos orçamentos mas algum é aceite, mostrar o popover mas sem o item "Criar Novo Orçamento"

#### 2. Garantir que o `obituary_id` é gravado no orçamento ao criar óbito
Isto já acontece (linha ~970). Verificar que após gravação, o `fetchLinkedQuotes` é chamado para atualizar o estado.

#### 3. Garantir que o `fromQuoteId` vincula corretamente no auto-save (rascunho)
Atualmente o `obituary_id` só é gravado no `handleSubmit` (gravação manual, linha 970). Se o óbito é criado via auto-save, o vínculo pode não acontecer. Corrigir o auto-save para também fazer o `update` do `budget_quotes.obituary_id` quando `fromQuoteId` está presente.

### Ficheiro a alterar
- `src/pages/NewObituary.tsx`

### Resumo das alterações
1. No auto-save: após criar o óbito (insert), se `fromQuoteId` existe, atualizar `budget_quotes.obituary_id` imediatamente
2. Na UI do botão de orçamento: se algum `linkedQuote` tem status `ACCEPTED`, esconder a opção "Criar Orçamento" / "Criar Novo Orçamento" — mostrar apenas "Ver Orçamento"

