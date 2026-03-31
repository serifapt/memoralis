

## Corrigir PDF para corresponder ao design original

### Problemas identificados (comparando PDF gerado vs referência)

1. **Foto não fica em grayscale** — `html2canvas` não suporta `filter: grayscale(100%)`. A foto sai a cores com tonalidade azul.
2. **Nome longo sobrepõe a idade/anos** — nomes como "Maria de Lourdes Carreira Rodrigues Dias" ultrapassam o espaço do nome e colidem com "· 1942 - 2026".
3. **Cortejo Fúnebre não é passado** — os dados de `cortejoEntries` existem no formulário mas não são enviados ao `AnnouncementGenerator`.

### Alterações

**1. `src/components/ObituaryTemplate/ObituaryTemplate.tsx`**

- Pré-processar a foto para grayscale via Canvas API (criar `useEffect` que converte a imagem para grayscale usando um canvas invisível e gera um data URL em preto-e-branco). Remover `filter: grayscale(100%)` do CSS e usar a imagem já convertida.
- Reduzir o `fontSize` do nome automaticamente quando o texto é longo (>25 chars → 26px, >35 chars → 22px) para evitar sobreposição com a linha de idade/localidade.

**2. `src/components/obituaries/AnnouncementGenerator.tsx`**

- Adicionar campos `cortejoDate`, `cortejoTime`, `cortejoLocation` à interface `obituaryData`.
- No `renderPreview()`, passar estes dados como `cortejoFunebre` ao `ObituaryTemplate`:
```tsx
cortejoFunebre={obituaryData.cortejoDate ? {
  date: formatDatePT(obituaryData.cortejoDate),
  startTime: formatTime(obituaryData.cortejoTime),
  location: obituaryData.cortejoLocation,
} : undefined}
```

**3. `src/pages/NewObituary.tsx`**

- Adicionar os campos de cortejo ao `obituaryData`:
```tsx
cortejoDate: cortejoEntries[0]?.date || "",
cortejoTime: cortejoEntries[0]?.time || "",
cortejoLocation: cortejoEntries[0]?.location || "",
```

### Secção técnica — Conversão grayscale

Em vez de depender do CSS filter (que `html2canvas` ignora), converter a imagem para grayscale via Canvas API antes de a renderizar:

```tsx
// Dentro de ObituaryTemplate
const [grayscalePhoto, setGrayscalePhoto] = useState<string | undefined>();

useEffect(() => {
  if (!photo) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
      data[i] = data[i+1] = data[i+2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    setGrayscalePhoto(canvas.toDataURL("image/jpeg", 0.95));
  };
  img.src = photo;
}, [photo]);
```

Usar `grayscalePhoto || photo` como `src` da imagem no template.

### Resultado esperado
- Foto renderiza em grayscale fiel no PDF
- Nomes longos ajustam-se automaticamente sem sobreposição
- Cortejo Fúnebre aparece no template quando preenchido

