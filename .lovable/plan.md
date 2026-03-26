

## Plano: Corrigir 6 problemas no template de anúncio A4

### 1. Foto com grayscale — `ObituaryTemplateA4.tsx`
- Adicionar `objectPosition: "center top"` e `background: "white"` ao container da foto
- Manter `filter: "grayscale(100%)"` na img (já existe)

### 2. Renomear "Câmara Ardente" para "Velório" — `ObituaryTemplateA4.tsx`
- Linha 237: comentário `{/* Câmara Ardente */}` → `{/* Velório */}`
- Linha 241: `title="Câmara Ardente"` → `title="Velório"`

### 3. Segundo telefone (phone2) — 3 ficheiros
O campo `telefone_secundario` já existe na tabela `funerarias` e no schema. Basta:

- **`NewObituary.tsx`**: Adicionar `telefone_secundario` ao `funerariaInfo` state type, ao select query (linha 271), ao setFunerariaInfo, e passar como `funerariaPhone2` ao AnnouncementGenerator (linha 2452)
- **`AnnouncementGenerator.tsx`**: Adicionar `funerariaPhone2?: string` à interface e passar como `phone2` ao template

### 4. Contactos dinâmicos — separador "|"
- **`ObituaryTemplateA4.tsx`**: Alterar o separador de telefones de `" · "` para `" | "` (linha 332)

### 5. Hora do velório
- A lógica já está correcta: o EventSection no template aceita `startTime` e mostra-o. O AnnouncementGenerator já passa `startTime: formatTime(obituaryData.velorioTime)`. Como só existe um campo de hora na BD, funciona como hora de início. Sem alterações necessárias.

### 6. html2canvas cross-origin — `AnnouncementGenerator.tsx`
- Alterar `allowTaint: true` → `allowTaint: false` e `backgroundColor: null` → `backgroundColor: "#ffffff"` nas duas chamadas html2canvas (generatePDF linha 202 e generateImage linha 252)

### Ficheiros editados
1. `src/components/obituaries/ObituaryTemplateA4.tsx` — foto background, renomear Velório, separador "|"
2. `src/components/obituaries/AnnouncementGenerator.tsx` — interface phone2, html2canvas options
3. `src/pages/NewObituary.tsx` — funerariaInfo com telefone_secundario, passar phone2

