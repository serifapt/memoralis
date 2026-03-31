

## Corrigir geração de PDF — abordagem unificada com html2canvas

### Problema

1. O template "Profissional" usa `window.print()` que abre uma nova janela — os estilos inline podem não renderizar corretamente neste contexto e o utilizador tem que manualmente "Guardar como PDF"
2. Os campos `cerimoniaDate`, `cerimoniaTime`, `cerimoniaChurch` nunca são passados ao `AnnouncementGenerator` — o formulário usa `formData.missa7Date`, `formData.missa7Time`, `formData.missa7Location` etc.

### Solução

**Ficheiro 1: `src/pages/NewObituary.tsx`** (linhas ~2620-2643)

Adicionar os campos de missa ao `obituaryData` passado ao `AnnouncementGenerator`:
```tsx
cerimoniaDate: formData.missa7Date || "",
cerimoniaTime: formData.missa7Time || "",
cerimoniaChurch: formData.missa7Location || "",
```

**Ficheiro 2: `src/components/obituaries/AnnouncementGenerator.tsx`**

Substituir o `generatePDF` para usar `html2canvas + jsPDF` para **todos** os templates (incluindo "profissional"):

```tsx
const generatePDF = async () => {
  setIsGenerating(true);
  try {
    const elementId = selectedTemplate === "profissional" 
      ? "obituary-template-a4" 
      : "announcement-preview";
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Template não encontrado");

    // Aguardar imagens
    const images = element.querySelectorAll("img");
    await Promise.all(Array.from(images).map(img =>
      img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); })
    ));
    await new Promise(r => setTimeout(r, 500));

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "JPEG", 0, 0, w, h);
    pdf.save(`anuncio-${obituaryData.displayName || "obituario"}.pdf`);

    toast({ title: "PDF gerado com sucesso" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast({ title: "Erro ao gerar PDF", variant: "destructive" });
  } finally {
    setIsGenerating(false);
  }
};
```

Isto elimina completamente a dependência do `window.print()` e usa o mesmo mecanismo fiável para todos os templates. O download do PDF é automático.

### Resumo de alterações

| Ficheiro | Alteração |
|---|---|
| `NewObituary.tsx` | Passar `cerimoniaDate/Time/Church` com dados de `missa7*` |
| `AnnouncementGenerator.tsx` | Unificar `generatePDF` com `html2canvas + jsPDF` para todos os templates |

