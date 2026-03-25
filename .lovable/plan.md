

## Plano: Melhorar PDF do orçamento

### Alterações

#### 1. Ocultar campos com valor 0 no PDF (`BudgetQuotePDF.tsx`)
- Filtrar linhas com `line_total === 0` (ou `unit_price === 0`) de cada secção antes de renderizar
- Ocultar secções inteiras se todas as linhas tiverem valor 0
- Ocultar a linha de subtotal da secção se o subtotal for 0

#### 2. Incorporar logo da funerária no PDF (`BudgetQuotePDF.tsx` + `BudgetQuoteDetail.tsx`)
- Adicionar prop `funerariaLogoUrl` ao componente `BudgetQuotePDF`
- No header do PDF, mostrar o logo à esquerda do nome da funerária (max ~60px altura)
- Em `BudgetQuoteDetail.tsx`, incluir `logo_url` na query de `funerarias` e passar ao componente PDF

#### 3. Melhorar estética do PDF (`BudgetQuotePDF.tsx`)
- Header: fundo com cor neutra escura (slate-800), texto branco, logo + nome lado a lado
- Caixa "ORÇAMENTO Nº" com estilo mais elegante (fundo colorido em vez de borda simples)
- Cards de Cliente e Falecido: headers com fundo colorido subtil, cantos arredondados
- Tabelas das secções: header com fundo slate, linhas alternadas (zebra striping)
- Caixa de total final: destaque visual mais forte com cor de fundo
- Tipografia mais refinada com melhor hierarquia visual
- Assinaturas: espaçamento mais generoso

### Ficheiros a alterar
- `src/components/budgets/BudgetQuotePDF.tsx` — redesign completo do template
- `src/pages/BudgetQuoteDetail.tsx` — adicionar `logo_url` à query e passar como prop

