

## Plano: Imprimir o mesmo PDF gerado

### Problema
O botão "Imprimir" copia o HTML do template para uma nova janela, mas as classes Tailwind não são incluídas — o resultado visual fica diferente do PDF gerado (que usa `html2canvas` para capturar o layout renderizado).

### Solução
Alterar `handlePrint` para gerar o PDF em memória (mesmo processo que `handleGeneratePDF`) e abri-lo numa nova aba para impressão, em vez de copiar HTML sem estilos.

### Alteração em `src/components/budgets/BudgetQuotePDF.tsx`

Substituir o `handlePrint` actual por:
1. Usar `html2canvas` + `jsPDF` para gerar o PDF em memória (igual ao `handleGeneratePDF`)
2. Em vez de `pdf.save()`, converter para blob URL com `pdf.output("bloburl")`
3. Abrir o blob URL numa nova janela e chamar `window.print()` nessa janela

```typescript
const handlePrint = async () => {
  if (!pdfRef.current) return;
  const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, logging: false });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  // ... same image sizing logic as handleGeneratePDF ...
  pdf.addImage(imgData, "PNG", imgX, 0, imgWidth * ratio, imgHeight * ratio);
  const blobUrl = pdf.output("bloburl");
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.addEventListener("load", () => { printWindow.print(); });
  }
};
```

### Ficheiro a alterar
- `src/components/budgets/BudgetQuotePDF.tsx` — apenas o método `handlePrint` (~10 linhas)

