

## Diagnóstico: PDF em branco (persistente)

### Causa raiz

O `ObituaryTemplate` usa extensivamente classes Tailwind (`bg-white`, `absolute`, `flex`, `items-center`, `shrink-0`, `overflow-hidden`, `whitespace-nowrap`, `whitespace-pre-wrap`, `rounded-[30px]`, etc.) em conjunto com inline styles.

Quando o `outerHTML` é copiado para a janela de impressão:
- O CSS do Vite/Tailwind é gerado dinamicamente e muitas vezes não é copiável via `document.styleSheets` (SecurityError em sheets cross-origin, ou sheets injetadas pelo HMR)
- Resultado: as classes Tailwind não resolvem → layout colapsa → página branca

### Solução

Substituir **todas** as classes Tailwind no `ObituaryTemplate.tsx` e `SeventhDayMassTemplate.tsx` por inline styles equivalentes, tornando o HTML auto-contido e independente de qualquer stylesheet externo.

### Ficheiros a alterar

**1. `src/components/ObituaryTemplate/ObituaryTemplate.tsx`**

Converter cada `className` Tailwind para o `style` equivalente:

| Classe Tailwind | Style inline equivalente |
|---|---|
| `bg-white` | `backgroundColor: "#fff"` |
| `relative` | `position: "relative"` |
| `absolute` | `position: "absolute"` |
| `overflow-hidden` | `overflow: "hidden"` |
| `overflow-clip` | `overflow: "clip"` |
| `flex` | `display: "flex"` |
| `flex-col` | `flexDirection: "column"` |
| `items-center` | `alignItems: "center"` |
| `items-start` | `alignItems: "flex-start"` |
| `justify-center` | `justifyContent: "center"` |
| `shrink-0` | `flexShrink: 0` |
| `whitespace-nowrap` | `whiteSpace: "nowrap"` |
| `whitespace-pre-wrap` | `whiteSpace: "pre-wrap"` |
| `rounded-[30px]` | `borderRadius: "30px"` |
| `w-full h-full` | `width: "100%", height: "100%"` |
| `size-full` | `width: "100%", height: "100%"` |
| `max-w-none` | `maxWidth: "none"` |
| `pointer-events-none` | `pointerEvents: "none"` |
| `bg-gray-200` | `backgroundColor: "#e5e7eb"` |
| `text-gray-400` | `color: "#9ca3af"` |
| `text-xs` | `fontSize: "12px"` |
| `text-[7px]` | `fontSize: "7px"` |
| `border border-gray-300` | `border: "1px solid #d1d5db"` |

Eliminar completamente os atributos `className` — mover tudo para `style`.

**2. `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx`**

Mesma conversão: todas as classes Tailwind → inline styles.

**3. `src/components/shared/icons.tsx`**

Verificar se os SVG icons usam classes Tailwind e converter para inline styles se necessário.

### Não alterar

- `AnnouncementGenerator.tsx` — as alterações anteriores (wrapper dimensions, font injection, URL absolutas, delay 800ms) mantêm-se
- `ObituaryPreview.tsx` / `SeventhDayMassPreview.tsx` — estes são wrappers de UI e podem manter Tailwind (não são exportados para PDF)

### Resultado esperado

O HTML do template será 100% auto-contido (inline styles + Google Fonts via `<link>`), garantindo renderização fiel na janela de impressão independentemente do Tailwind/Vite.

