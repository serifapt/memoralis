

## Plano: Converter orçamento aceite em processo de óbito

### Contexto
O orçamento já armazena dados do cliente (via `client_id`) e do falecido (`deceased_name`, `death_date`, `place_of_death`, `funeral_date`, `cemetery`). Quando o orçamento é aceite (ACCEPTED), o utilizador deve poder converter esses dados num novo processo de óbito com os campos pré-preenchidos.

A tabela `budget_quotes` já tem `obituary_id` (FK para obituaries), que hoje é usado quando o orçamento nasce a partir de um óbito. Vamos reutilizar esse campo na direcção inversa: quando se cria um óbito a partir de um orçamento aceite, guardamos a referência.

### Alterações

#### 1. Botão "Converter em Processo" no `BudgetQuoteDetail.tsx`
- Quando `status === "ACCEPTED"` e **não existe** `obituary_id`, mostrar um botão "Criar Processo de Óbito"
- Ao clicar, navegar para `/obituaries/new` passando os dados do orçamento via query params ou state:
  - `fromQuoteId` — ID do orçamento
  - Os dados são carregados na página de destino a partir do orçamento

#### 2. Pré-preenchimento no `NewObituary.tsx`
- Detectar `fromQuoteId` nos search params
- Carregar o orçamento e o cliente associado
- Pré-preencher:
  - **Falecido**: `display_name`, `death_date`, `death_location` (do orçamento)
  - **Cliente/Família**: `familyName`, `familyPhone`, `familyNif`, `familyEmail`, `familyRelationship`, `familyAddress`, `familyLocality`, `familyPostalCode` (do cliente associado)
  - **Cerimónia**: activar toggle de funeral e preencher `funeralDate` e `funeralCemetery` (se existirem no orçamento)

#### 3. Vincular orçamento ao óbito após criação
- Após gravar o novo óbito (no `handleSubmit` do `NewObituary.tsx`), se `fromQuoteId` estiver presente:
  - Fazer `UPDATE budget_quotes SET obituary_id = <novo_obituary_id> WHERE id = <fromQuoteId>`
  - Assim o orçamento fica ligado ao processo

#### 4. Indicação visual no orçamento
- Quando o orçamento já tem `obituary_id`, mostrar um link "Ver Processo de Óbito" em vez do botão de criar

### Ficheiros a alterar
- `src/pages/BudgetQuoteDetail.tsx` — botão de conversão + link para óbito existente
- `src/pages/NewObituary.tsx` — lógica de pré-preenchimento a partir de orçamento

### Sem alterações de backend
A tabela `budget_quotes` já tem a coluna `obituary_id`. Não são necessárias migrações.

