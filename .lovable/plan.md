

## Plano: Alinhar auto-save com save manual e garantir integridade dos dados familiares

### Problema encontrado

A função `saveObituary` (auto-save, linha 896) **não inclui nenhum campo `family_*`** no objecto `obituaryData` que grava na base de dados. Apenas grava os dados do falecido e o `responsible_client_id`.

Em contraste, o `handleSubmit` (save manual, linha 660) inclui todos os 15 campos `family_*`.

**Consequência**: cada auto-save (a cada 1.5s após edição) sobrescreve o registo e **apaga** `family_name`, `family_niss`, `family_iban`, `family_civil_status`, `family_id_card`, etc. Quando a página é recarregada ou o PDF é gerado após reload, os dados familiares estão a `null`.

### Solução

#### 1. Adicionar campos `family_*` ao auto-save
Acrescentar os 15 campos familiares ao objecto `obituaryData` dentro de `saveObituary` (linha ~896), alinhando-o com o `handleSubmit`:

```
family_name, family_relationship, family_email, family_phone,
family_nif, family_niss, family_naturalidade, family_iban,
family_address, family_locality, family_postal_code,
family_observations, family_birth_date, family_civil_status, family_id_card
```

#### 2. Remover casts desnecessários `(formData as any)`
Os campos `familyCivilStatus` e `familyIdCard` já existem no estado inicial do `formData` (linhas 152-153). Os casts `(formData as any)` nas linhas 702-703 e 2166/2177 são desnecessários e devem ser removidos.

### Ficheiros a alterar

- **`src/pages/NewObituary.tsx`**
  - `saveObituary` (~linha 896): adicionar os 15 campos `family_*` ao objecto de dados
  - Remover casts `(formData as any)` para `familyCivilStatus` e `familyIdCard`

### Resultado esperado

- Os dados familiares deixam de ser apagados pelo auto-save
- Os PDFs gerados após reload da página continuam preenchidos correctamente
- Consistência total entre save manual e auto-save

