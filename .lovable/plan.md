

## Plano: Adicionar campos Freguesia, Concelho e Distrito do requerente

### Problema

O PDF RP-5033 (e potencialmente outros) tem 3 campos em branco que o processo do óbito não recolhe para o requerente/familiar:
- **Estado civil** — já existe no DB (`family_civil_status`) e no formulário, mas pode não estar a ser preenchido pelo utilizador
- **Freguesia** — não existe no processo
- **Concelho** — não existe no processo
- **Distrito** — não existe no processo

### Solução

#### 1. Migração SQL — adicionar 3 colunas à tabela `obituaries`
```sql
ALTER TABLE public.obituaries
  ADD COLUMN family_freguesia text,
  ADD COLUMN family_concelho text,
  ADD COLUMN family_distrito text;
```

#### 2. Formulário — adicionar 3 inputs no tab Familiar (`src/pages/NewObituary.tsx`)
- Adicionar `familyFreguesia`, `familyConcelho`, `familyDistrito` ao estado inicial do `formData`
- Adicionar 3 campos de input na secção do familiar responsável (junto à Localidade/Código Postal)
- Incluir os 3 campos no `handleSubmit` e no `saveObituary` (auto-save)
- Carregar os valores no `useEffect` de carregamento do óbito

#### 3. PDF filler — mapear os novos campos (`src/lib/pdf-form-filler.ts`)
- Adicionar `familyFreguesia`, `familyConcelho`, `familyDistrito` à interface `ObituaryFormData`
- Atualizar `fillRP5033()` para mapear estes campos para os campos AcroForm correspondentes (Freguesia, Concelho, Distrito)
- Atualizar `fillRP5075()` e outros formulários que também tenham estes campos
- Confirmar que `familyCivilStatus` está corretamente mapeado no RP-5033 (campo `Estado civil` ou equivalente)

#### 4. DocumentsTab — passar os novos campos ao gerador (`src/components/obituaries/DocumentsTab.tsx`)
- Adicionar `familyFreguesia`, `familyConcelho`, `familyDistrito` ao objecto `formData` passado a `fillPdfForm()`

### Ficheiros a alterar
- **Migração SQL** — 3 novas colunas
- **`src/pages/NewObituary.tsx`** — estado, inputs, persistência
- **`src/lib/pdf-form-filler.ts`** — interface + mapeamentos
- **`src/components/obituaries/DocumentsTab.tsx`** — passar dados ao gerador

