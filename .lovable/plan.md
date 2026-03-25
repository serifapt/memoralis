

## Plano: Corrigir PDFs corrompidos e auditar campos em falta

### Problema principal
Os ficheiros PDF em `public/templates/` foram salvos como texto em vez de dados binários, corrompendo a estrutura interna. Isto causa o erro `Expected instance of PDFDict2` ao tentar carregar os templates com `pdf-lib`.

### Solução em 3 partes

#### 1. Restaurar os 9 PDFs originais
Copiar os PDFs originais do utilizador para `public/templates/` usando cópia binária correcta:
- `RP-5033.pdf`, `RP-5075.pdf`, `MG-14.pdf`, `RP-5018.pdf`, `RP-5076.pdf`, `RP-5077.pdf`, `RP-5078.pdf`, `RP-5083.pdf`, `RV-1017.pdf`

#### 2. Extrair os nomes reais dos form fields de cada PDF
Usar `pypdf` num script para listar todos os campos AcroForm de cada template. Com esta informação, corrigir os mapeamentos no `pdf-form-filler.ts`.

#### 3. Auditoria de campos: PDF vs Processo de Óbito

Campos **já existentes** no processo (`formData` em `NewObituary.tsx`):

| Campo processo | Campo DB | Disponível |
|---|---|---|
| fullName | full_name | Sim |
| birthDate | birth_date | Sim |
| deathDate | death_date | Sim |
| deathTime | death_time | Sim |
| birthPlace | birth_place | Sim |
| nationality | nationality | Sim |
| civilStatus | civil_status | Sim |
| profession | profession | Sim |
| taxId (NIF) | tax_id | Sim |
| socialSecurity (NISS) | social_security | Sim |
| idCard (CC) | id_card | Sim |
| deathLocation | death_location | Sim |
| cause | cause | Sim |
| doctor | doctor | Sim |
| beneficiary | beneficiary | Sim |
| familyName | family_name | Sim |
| familyRelationship | family_relationship | Sim |
| familyEmail | family_email | Sim |
| familyPhone | family_phone | Sim |
| familyNif | family_nif | Sim |
| familyNiss | family_niss | Sim |
| familyIban | family_iban | Sim |
| familyNaturalidade | family_naturalidade | Sim |
| familyAddress | family_address | Sim |
| familyLocality | family_locality | Sim |
| familyPostalCode | family_postal_code | Sim |
| familyBirthDate | family_birth_date | Sim |

Campos **que os formulários pedem mas NÃO existem** no processo:

| Campo PDF | Formulários onde aparece | Proposta |
|---|---|---|
| Estado civil do requerente | RP-5075, RP-5076 | Adicionar `familyCivilStatus` |
| Nº documento identificação do requerente (CC) | RP-5083, RV-1017 | Adicionar `familyIdCard` |
| País de residência do requerente | RV-1017 | Usar `nationality` ou adicionar campo |
| Distrito/Concelho/Freguesia do requerente | RP-5033 | Expandir `familyNaturalidade` ou usar `familyLocality` |
| IBAN em campos separados (IBAN completo) | MG-14 | Já existe `familyIban` |

#### 4. Implementação

**Ficheiros a alterar:**
- `public/templates/*.pdf` — restaurar binários correctos
- `src/lib/pdf-form-filler.ts` — corrigir mapeamentos com nomes reais dos campos
- `src/pages/NewObituary.tsx` — adicionar 2 campos novos (`familyCivilStatus`, `familyIdCard`) no tab Familiar
- Migração SQL — adicionar `family_civil_status` e `family_id_card` à tabela `obituaries`

**Abordagem:**
1. Restaurar PDFs binários
2. Executar script de inspecção dos campos reais
3. Corrigir todos os mapeamentos em `pdf-form-filler.ts`
4. Adicionar os 2 campos em falta ao processo
5. Testar geração de todos os 9 formulários

