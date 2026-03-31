

## Exportação PDF via Impressão Nativa

Substituir completamente o fluxo `html2canvas` + `jsPDF` pela impressão nativa do browser, que reproduz fielmente o que está no preview.

### Abordagem

1. **Botão "Gerar PDF"** abre uma nova janela com apenas o template A4 e estilos `@media print` que definem o tamanho A4 sem margens.
2. A nova janela chama `window.print()` automaticamente — o utilizador escolhe "Guardar como PDF" no diálogo do browser.
3. Elimina-se a dependência do `html2canvas` para o template profissional (mantém-se para os outros templates e para a geração de imagens story/post).

### Correcção do logo Memoralis

Adicionar `filter: "grayscale(100%) brightness(0)"` ao `<img>` do logo na `ObituaryTemplateA4.tsx` para que apareça sempre a preto, independentemente do método de exportação.

### Ficheiros a alterar

- **`src/components/obituaries/ObituaryTemplateA4.tsx`** — adicionar `filter` ao logo para ficar a preto
- **`src/components/obituaries/AnnouncementGenerator.tsx`** — substituir `generatePDF` por um fluxo que:
  1. Cria uma janela nova com `window.open()`
  2. Escreve o HTML do template com estilos inline + `@media print { @page { size: A4; margin: 0; } }`
  3. Aguarda que as imagens carreguem
  4. Chama `printWindow.print()`
  5. Fecha a janela após impressão

### Resultado esperado

O PDF gerado será idêntico ao preview, sem distorções de foto, logo ou alinhamento, porque o browser renderiza nativamente o mesmo HTML/CSS.

