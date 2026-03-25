

## Plano: Mover "Tipo de Serviço" para Orçamentos e remover tab do óbito

### Resumo
Eliminar o tab "Informação do Serviço" do processo de óbito (`NewObituary.tsx`) e adicionar o campo "Tipo de Serviço" à secção "Dados do Falecido" nos orçamentos (`BudgetQuoteDetail.tsx`), renomeando-a para "Informações Gerais".

### 1. Migração de base de dados
Adicionar coluna `service_type` à tabela `budget_quotes`:
```sql
ALTER TABLE budget_quotes ADD COLUMN service_type text;
```

### 2. Alterações em `src/pages/NewObituary.tsx`
- Remover o `TabsTrigger` "Informação do Serviço" (`value="servico"`) da lista de tabs (~linha 1074)
- Remover todo o `TabsContent value="servico"` (~linhas 2295-2365)
- Os campos `serviceType`, `coffinBrand`, `coffinRef`, `servicePrice` permanecem no `formData` e na persistência para não perder dados existentes, mas deixam de ter UI no formulário de óbito

### 3. Alterações em `src/pages/BudgetQuoteDetail.tsx`
- Renomear o título da secção de "Dados do Falecido" para "Informações Gerais" (~linha 561)
- Adicionar um campo `Select` "Tipo de Serviço" com as opções: Funeral Completo, Cremação, Translado, Serviço Básico
- Adicionar `service_type` ao `formData` state (inicializado como `""`)
- Mapear o valor ao carregar o orçamento existente e incluí-lo no `updateQuote`/`createQuoteWithSections`

### 4. Alterações em `src/hooks/useBudgetQuotes.ts`
- Adicionar `service_type` à interface `BudgetQuote`
- Adicionar `service_type` à interface `BudgetQuoteFormData`

### Ficheiros a alterar
- `src/pages/NewObituary.tsx` — remover tab "Serviço"
- `src/pages/BudgetQuoteDetail.tsx` — renomear secção + adicionar campo
- `src/hooks/useBudgetQuotes.ts` — actualizar interfaces
- Migração SQL — nova coluna

