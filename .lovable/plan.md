

## Plano: Ajustar campos obrigatórios

### Alterações em `src/pages/NewObituary.tsx`

1. **Adicionar `deathLocation` ao `hasMinimumFields`** (linha ~176): O campo "Local de Falecimento" da imagem não está na validação mínima. Adicionar `formData.deathLocation.trim()` à verificação.

2. **Validação condicional no Funeral**: Quando o toggle `funeral` está ativo, marcar `funeralDate` e `funeralCemetery` como obrigatórios — adicionar validação no `saveObituary` que impede gravação se o funeral está ativo mas estes campos estão vazios, e mostrar indicação visual (asterisco) nos labels desses campos.

### Resumo dos campos obrigatórios finais

**Dados do Falecido**: displayName, deathDate, birthDate, freguesia, locality, deathLocation

**Cliente**: familyName, familyPhone, familyNif, familyRelationship, familyAddress, familyLocality, familyPostalCode

**Cerimónias (quando Funeral ativo)**: funeralDate, funeralCemetery

