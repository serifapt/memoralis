

## Diagnóstico: PDF em branco

### Causa raiz

O container offscreen (linha 523) que serve como alvo de captura para PDF:

```html
<div id="obituary-template-a4" style="position: absolute; left: -9999px; top: -9999px">
  <!-- ObituaryTemplate com 595×842px -->
</div>
```

O template novo usa `position: relative` + `overflow: hidden` com dimensões fixas `595×842px`. Quando o `outerHTML` é copiado para a janela de impressão, dois problemas ocorrem:

1. **O wrapper `#obituary-template-a4` não tem dimensões** — é um div genérico sem `width`/`height`, e na nova janela (sem o layout do React) pode colapsar ou clipar o conteúdo.
2. **Fontes e CSS do Tailwind não carregam a tempo** — o `cssText` é copiado mas as `@font-face` do Google Fonts e as classes Tailwind podem não estar resolvidas na nova janela antes do `print()`.
3. **Imagens com URLs relativas** — imagens como `/images/flores-obituario.png` ou logos do Supabase Storage podem não carregar na nova janela por falta de base URL.

### Solução

Corrigir o `generatePDF` no `AnnouncementGenerator.tsx`:

1. **Dar dimensões explícitas ao wrapper offscreen** para que o conteúdo não colapse:
   ```tsx
   <div id="obituary-template-a4" style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "595px", height: "842px" }}>
   ```

2. **Incluir os Google Fonts via `<link>` na janela de impressão** em vez de depender apenas do CSS copiado:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto:wght@500&display=swap" rel="stylesheet" />
   ```

3. **Converter URLs relativas em absolutas** no `outerHTML` antes de injectar na janela de impressão, usando `window.location.origin` como prefixo para `src="/..."`.

4. **Aumentar o delay de estabilização** de 400ms para ~800ms para dar tempo às fontes de carregarem na nova janela.

### Ficheiro a alterar

**`src/components/obituaries/AnnouncementGenerator.tsx`** — duas alterações:

**Alteração A — Wrapper offscreen (linha 523):**
Adicionar `width: 595px; height: 842px` ao style do div `#obituary-template-a4`.

**Alteração B — `generatePDF` (linhas 241-317):**
- Injectar `<link>` do Google Fonts no `<head>` do HTML da janela de impressão
- Substituir URLs relativas (`src="/...`) por absolutas no `outerHTML`
- Aumentar delay para 800ms
- Adicionar `background: white` explícito ao body do HTML de impressão

