

## Substituir templates com versão compatível html2canvas (object-fit)

### Problema
As imagens nos templates actuais usam posicionamento absoluto com percentagens (`width: 107.67%`, `top: -0.56%`, `left: -2.83%`, etc.) que `html2canvas` não renderiza correctamente, causando imagens encolhidas/desconfiguradas no PDF.

### Solução
Substituir o posicionamento percentual por `object-fit: cover` em todas as imagens dos dois templates, e garantir que o contentor offscreen usa `position: fixed` (não `display: none`).

### Alterações

**Ficheiro 1: `src/components/ObituaryTemplate/ObituaryTemplate.tsx`**

Corrigir 4 imagens que usam posicionamento percentual:

1. **Foto do falecido** (linha ~209-224) — remover `position: absolute`, `width: 107.67%`, `height: 134.58%`, `top: -0.56%`, `left: -2.83%`. Usar:
```tsx
style={{
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center top",
  ...(grayscalePhoto ? {} : { filter: "grayscale(100%)" }),
}}
```

2. **Logo funerária** (linha ~382-386) — remover `position: absolute`, `width: 123.17%`, `height: 131.16%`, `top: -14.88%`, `left: -11.46%`. Usar:
```tsx
style={{
  width: "100%",
  height: "100%",
  objectFit: "contain",
  pointerEvents: "none",
}}
```

3. **Flores decorativas** (linha ~467-470) — remover posicionamento percentual. Usar:
```tsx
style={{
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "right bottom",
  pointerEvents: "none",
}}
```

4. **Logo memoralis e QR code** (linhas ~190, ~423) — já usam `width: 100%, height: 100%` que é compatível, mas remover `position: absolute` e `maxWidth: none` desnecessários. Usar:
```tsx
style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
```

**Ficheiro 2: `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx`**

Aplicar exactamente as mesmas correcções de `object-fit` às mesmas 4 imagens:
- Foto (linha ~111-125)
- Logo funerária (linha ~268-271)
- Flores (linha ~353-356)
- Logo memoralis e QR code

**Ficheiro 3: `src/components/obituaries/AnnouncementGenerator.tsx`**

Corrigir o contentor offscreen (linha 470) para usar `position: fixed` em vez de `position: absolute`:
```tsx
<div id="obituary-template-a4" style={{
  position: "fixed",
  left: "-9999px",
  top: 0,
  width: "595px",
  height: "842px",
}}>
```

A configuração do `html2canvas` e `jsPDF` já está correcta (scale: 2, useCORS, width/height 595x842, PNG, px_scaling).

### Secção técnica

| Imagem | Antes (incompatível) | Depois (compatível) |
|---|---|---|
| Foto | `position: absolute; width: 107.67%; top: -0.56%` | `width: 100%; height: 100%; object-fit: cover` |
| Logo funerária | `position: absolute; width: 123.17%; top: -14.88%` | `width: 100%; height: 100%; object-fit: contain` |
| Flores | `position: absolute; width: 85.42%; top: 0.25%` | `width: 100%; height: 100%; object-fit: contain` |
| Logo/QR | `position: absolute; maxWidth: none` | `object-fit: contain` |
| Contentor offscreen | `position: absolute` | `position: fixed` |

