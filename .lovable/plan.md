

## Implementar solução de geração PDF com mapeamento correcto

A solução proposta é sólida. Vou adaptar as melhorias ao código existente, mantendo a estrutura actual do `AnnouncementGenerator`.

### Alterações

**Ficheiro: `src/components/obituaries/AnnouncementGenerator.tsx`**

1. **Corrigir `generatePDF`** — usar `px` como unidade no jsPDF com `hotfixes: ["px_scaling"]`, formato `[595, 842]`, e `PNG` em vez de `JPEG`. Adicionar `width: 595, height: 842` explícitos no `html2canvas` para garantir captura exacta do contentor A4:

```typescript
const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  backgroundColor: "#ffffff",
  width: 595,
  height: 842,
});

const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF({
  unit: "px",
  format: [595, 842],
  hotfixes: ["px_scaling"],
});
pdf.addImage(imgData, "PNG", 0, 0, 595, 842);
```

2. **Corrigir cálculo de idade** — implementar o cálculo preciso (ajustar se ainda não fez anos no ano de falecimento), em vez do simples `deathYear - birthYear`.

3. **Manter tudo o resto** — o mapeamento de dados no `NewObituary.tsx` e a estrutura de `renderPreview()` já estão correctos desde as alterações anteriores. Não é necessário criar um componente `PDFRenderer` separado — o div offscreen actual cumpre a mesma função.

### Secção técnica

| Aspecto | Actual (problema) | Proposto (fix) |
|---|---|---|
| Unidade jsPDF | `mm` com formato `a4` | `px` com `[595, 842]` + `hotfixes` |
| Formato imagem | JPEG | PNG (melhor qualidade, sem artefactos) |
| Dimensões html2canvas | Sem `width/height` explícitos | `width: 595, height: 842` |
| Escala | 3x (pesado) | 2x (suficiente para impressão) |
| Cálculo idade | `deathYear - birthYear` | Ajustado por mês/dia |

