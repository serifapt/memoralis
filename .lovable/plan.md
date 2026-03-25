

## Plano: Corrigir preenchimento dos formulários PDF

### Problema identificado

Há **dois problemas** a causar campos vazios nos PDFs gerados:

1. **Nomes dos campos PDF incorrectos** — Os nomes usados no `setTextField(form, 'NomeCampo', ...)` foram estimados, não extraídos dos PDFs reais. Quando o nome não coincide, o `setTextField` falha silenciosamente e o campo fica vazio.

2. **Dados do requerente não persistem no óbito** — Os campos `familyNiss`, `familyIban`, `familyNaturalidade` e `familyBirthDate` existem apenas na tabela `clients`, mas não na tabela `obituaries`. Se o óbito for carregado sem cliente associado, estes campos ficam vazios.

### Solução

#### 1. Migração de base de dados
Adicionar 4 colunas à tabela `obituaries` para persistir os dados do requerente necessários para os documentos:

```sql
ALTER TABLE obituaries
  ADD COLUMN family_niss text,
  ADD COLUMN family_iban text,
  ADD COLUMN family_naturalidade text,
  ADD COLUMN family_birth_date date;
```

#### 2. Actualizar persistência em `NewObituary.tsx`
No `handleSave`, incluir os 4 novos campos no objecto enviado ao Supabase (`family_niss`, `family_iban`, `family_naturalidade`, `family_birth_date`). No load do óbito, mapear estes campos para o `formData`.

#### 3. Adicionar botão "Inspeccionar campos" no `DocumentsTab.tsx`
Botão temporário (pode ficar permanente para debug) que, ao clicar, chama `listPdfFields(docId)` e mostra num modal/console os nomes reais dos campos de cada PDF. Isto permite-nos corrigir os mapeamentos.

#### 4. Corrigir todos os mapeamentos em `pdf-form-filler.ts`
Após inspecção dos campos reais, actualizar todas as 9 funções `fillXXX()` com os nomes correctos dos form fields. Esta correcção será feita iterativamente — primeiro inspeccionamos, depois corrigimos.

### Ficheiros a alterar
- Migração SQL — 4 novas colunas em `obituaries`
- `src/pages/NewObituary.tsx` — persistir e carregar os 4 campos
- `src/components/obituaries/DocumentsTab.tsx` — botão para inspeccionar campos dos PDFs
- `src/lib/pdf-form-filler.ts` — corrigir mapeamentos após inspecção

### Abordagem iterativa
A implementação será em duas fases:
1. **Fase 1** (esta iteração): migração DB + persistência + botão de inspecção de campos
2. **Fase 2** (iteração seguinte): com os nomes reais dos campos descobertos, corrigir todos os mapeamentos

