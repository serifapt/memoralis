

## Plano: Percentagem de preenchimento só com campos pessoais e da família

### Alteração

**`src/pages/NewObituary.tsx`** — Substituir o cálculo atual do `completionPercentage` (linhas 172-176) que conta todos os campos do `formData`, por um cálculo que apenas considera:

**Campos pessoais do falecido:**
`displayName`, `fullName`, `birthDate`, `freguesia`, `locality`, `birthPlace`, `nationality`, `civilStatus`, `profession`, `idCard`, `taxId`, `socialSecurity`, `beneficiary`, `deathLocation`, `deathDate`, `deathTime`, `cause`, `doctor`, `medicalCertificate`

**Campos da família:**
`familyName`, `familyRelationship`, `familyEmail`, `familyPhone`, `familyNif`, `familyNiss`, `familyNaturalidade`, `familyIban`, `familyAddress`, `familyLocality`, `familyPostalCode`, `familyObservations`, `familyBirthDate`, `familyCivilStatus`, `familyIdCard`, `familyFreguesia`, `familyConcelho`, `familyDistrito`

Ficam **excluídos** do cálculo: campos de cerimónias (funeral, cremação, missas, velório), notas/observações gerais, informação do serviço, `publicMessage`, `hideCondolences`.

### Implementação

Criar um array `personalAndFamilyFields` com as chaves acima e calcular a percentagem apenas com esses campos:

```typescript
const personalAndFamilyFields = ["displayName", "fullName", "birthDate", ...];
const filledCount = personalAndFamilyFields.filter(key => formData[key] !== "" && formData[key] !== false).length;
const completionPercentage = Math.round((filledCount / personalAndFamilyFields.length) * 100);
```

### Ficheiro
- `src/pages/NewObituary.tsx` (linhas 172-176)

