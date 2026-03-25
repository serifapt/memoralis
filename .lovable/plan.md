

## Plano: Preenchimento automático dos formulários originais da Segurança Social

### Resumo
Substituir os 11 documentos genéricos actuais por 9 formulários oficiais da Segurança Social. Em vez de gerar PDFs novos com jsPDF, vamos usar a biblioteca **pdf-lib** para abrir os PDFs originais e preencher directamente os campos de formulário (form fields) existentes nos PDFs.

### Abordagem técnica

Os PDFs da Segurança Social portuguesa são formulários interactivos com campos preenchíveis (AcroForm fields). A biblioteca `pdf-lib` (JavaScript, funciona no browser) permite:
1. Carregar o PDF original
2. Aceder aos form fields pelo nome
3. Preencher os valores com dados do processo
4. Gerar o PDF preenchido para download

### 1. Armazenar os PDFs originais

Copiar os 9 PDFs para `public/templates/`:
- `RP-5033.pdf` — Subsídio de Funeral
- `RP-5075.pdf` — Prestações por Morte
- `MG-14.pdf` — Registo/Alteração IBAN
- `RP-5018.pdf` — Prestações por Morte (Regime não contributivo)
- `RP-5076.pdf` — Reembolso Despesas Funeral
- `RP-5077.pdf` — Pedido de Pensão Instituição Estrangeira
- `RP-5078.pdf` — Declaração Ato Responsabilidade Terceiro
- `RP-5083.pdf` — Situação União de Facto
- `RV-1017.pdf` — Identificação Cidadão Estrangeiro

### 2. Instalar dependência

Adicionar `pdf-lib` ao projecto (funciona 100% client-side, sem backend).

### 3. Criar utilitário de preenchimento de PDFs

Criar `src/lib/pdf-form-filler.ts` com:
- Função genérica `fillPdfForm(templateUrl, fieldMapping)` que carrega o template, preenche os campos e retorna um Blob
- Para cada formulário, uma função de mapeamento que traduz `obituaryData` → nomes dos form fields do PDF
- Necessário primeiro inspeccionar os nomes exactos dos form fields de cada PDF (usando pdf-lib `getForm().getFields()`)

### 4. Criar fase de descoberta dos campos

Criar uma função auxiliar que, ao clicar "Inspeccionar campos", lista todos os form fields de cada PDF. Isto será usado durante o desenvolvimento para mapear correctamente os campos. Pode ficar como ferramenta de debug temporária.

### 5. Alterar `DocumentsTab.tsx`

- Substituir `AUTO_DOCUMENT_TYPES` pelos 9 formulários da Segurança Social
- O botão "Gerar PDF" passa a:
  1. Fetch do template original de `public/templates/`
  2. Preencher os form fields com os dados do óbito via pdf-lib
  3. Guardar o PDF preenchido no storage e registar na DB
- Manter a possibilidade de download do template original em branco

### 6. Mapeamento de dados (obituaryData → campos PDF)

Dados já disponíveis no `formData`:

| Dado | Campo formData | Uso nos formulários |
|------|---------------|-------------------|
| Nome falecido | `fullName` | Todos |
| Data nascimento | `birthDate` | Todos |
| Data falecimento | `deathDate` | Todos |
| NISS falecido | `socialSecurity` | Todos |
| NIF falecido | `taxId` | Todos |
| Naturalidade | `birthPlace` | RP-5033, RV-1017 |
| Nacionalidade | `nationality` | RV-1017 |
| Estado civil | `civilStatus` | RP-5075, RP-5076 |
| Profissão | `profession` | RV-1017 |
| Causa morte | `cause` | RP-5033, RP-5075, RP-5076 |
| Nome requerente | `familyName` | Todos |
| Telefone req. | `familyPhone` | Todos |
| Email req. | `familyEmail` | Todos |
| NIF req. | `familyNif` | Todos |
| NISS req. | `familyNiss` | Todos |
| IBAN req. | `familyIban` | RP-5033, MG-14 |
| Naturalidade req. | `familyNaturalidade` | RP-5033 |
| Morada req. | `familyAddress` | Todos |
| Localidade req. | `familyLocality` | Todos |
| Código postal req. | `familyPostalCode` | Todos |
| Parentesco | `familyRelationship` | RP-5075, RP-5076 |

**Campo em falta a adicionar no formulário do óbito:**
- `familyBirthDate` — Data de nascimento do requerente (necessário em quase todos os formulários)

### 7. Migração de base de dados

Não é necessária migração na tabela `obituaries` — o campo `family_birth_date` pode ser guardado na tabela `clients` que já tem os campos do requerente. Basta adicionar a coluna:

```sql
ALTER TABLE clients ADD COLUMN birth_date date;
```

### 8. Alterações no formulário do óbito

Em `NewObituary.tsx`, no tab "Familiar Responsável":
- Adicionar campo "Data de Nascimento" (com Popover + Calendar, padrão uniforme) usando `familyBirthDate`
- Persistir para a tabela `clients` como `birth_date`

### Limitação e abordagem iterativa

Se algum PDF não tiver form fields editáveis (PDF "flat"), será necessário usar uma abordagem com pdf-lib para desenhar texto nas coordenadas correctas. A primeira acção será inspeccionar os form fields de cada PDF. Se forem flat, a alternativa será overlay de texto nas posições certas.

### Ficheiros a criar/alterar
- `public/templates/` — 9 PDFs originais
- `src/lib/pdf-form-filler.ts` — utilitário de preenchimento (novo)
- `src/components/obituaries/DocumentsTab.tsx` — substituir documentos + lógica
- `src/pages/NewObituary.tsx` — adicionar campo data nascimento requerente
- Migração SQL — coluna `birth_date` na tabela `clients`

