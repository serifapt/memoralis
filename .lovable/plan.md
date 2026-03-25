

## Plano: Corrigir bloqueio do Chrome ao imprimir

### Problema
O `window.open()` é chamado **depois** de operações assíncronas (`await html2canvas`, criação do jsPDF). O Chrome (e outros browsers) bloqueiam popups que não são abertos no contexto directo de um gesto do utilizador. Como o `await` quebra essa ligação, o popup é bloqueado.

### Solução
Abrir a janela **antes** das operações assíncronas (mantendo o contexto do clique do utilizador), e depois escrever o conteúdo do PDF nessa janela já aberta.

### Alteração em `src/components/budgets/BudgetQuotePDF.tsx`

Substituir o `handlePrint` (~linhas 78-107) por:

```typescript
const handlePrint = async () => {
  if (!pdfRef.current) return;

  // Abrir janela ANTES do await para não perder o contexto do clique
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("O browser bloqueou a janela de impressão. Permita popups para este site.");
    return;
  }
  printWindow.document.write("<p>A preparar impressão...</p>");

  try {
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    pdf.addImage(imgData, "PNG", imgX, 0, imgWidth * ratio, imgHeight * ratio);
    const blobUrl = pdf.output("bloburl");

    printWindow.location.href = blobUrl;
    printWindow.addEventListener("load", () => { printWindow.print(); });
  } catch (error) {
    console.error("Erro ao gerar PDF para impressão:", error);
    printWindow.close();
  }
};
```

### Ficheiro a alterar
- `src/components/budgets/BudgetQuotePDF.tsx` — apenas o método `handlePrint`

