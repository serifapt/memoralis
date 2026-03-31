

## Integrar SeventhDayMassTemplate no AnnouncementGenerator

### O que muda

Quando `announcementType === "missa_7"` e `selectedTemplate === "profissional"`, o preview e a exportação PDF devem usar o `SeventhDayMassTemplate` em vez do `ObituaryTemplateA4`.

### Alterações em `src/components/obituaries/AnnouncementGenerator.tsx`

1. **Import** do `SeventhDayMassTemplate` de `@/components/SeventhDayMassTemplate`

2. **`renderPreview()`** — dentro do bloco `selectedTemplate === "profissional"`, adicionar condição: se `announcementType === "missa_7"`, renderizar `SeventhDayMassTemplate` com as props mapeadas:
   - `fullName`, `photo` (grayscale), `age`, `birthYear`, `deathYear`, `parish`, `municipality`
   - `massDate` ← `formatDatePT(obituaryData.cerimoniaDate)`
   - `massStartTime` ← `formatTime(obituaryData.cerimoniaTime)`
   - `massLocation` ← `obituaryData.cerimoniaChurch`
   - `familyText` ← mensagem pública (mesmo toggle `includeFamilyMessage`)
   - Contactos da funerária (`funeralHomeLogo`, `phone1`, `phone2`, `email`, `website`)
   - `flowerImage` ← `/images/flores-obituario.png`

3. **`generatePDF()`** — o ID do elemento a capturar para impressão nativa já funciona se o `SeventhDayMassTemplate` usar o mesmo `id="obituary-template-a4"`. Verificar se o componente tem este ID; caso contrário, envolvê-lo num `<div id="obituary-template-a4">`.

### Sem novos ficheiros

Apenas edição do `AnnouncementGenerator.tsx`.

