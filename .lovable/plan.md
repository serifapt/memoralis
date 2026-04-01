

## Reescrever templates sem className para compatibilidade html2canvas

### Problema
Os templates e ícones usam `className` Tailwind (`flex`, `absolute`, `shrink-0`, `overflow-hidden`, etc.) que o `html2canvas` não interpreta — apenas lê estilos inline e computed styles. Isto causa layout quebrado no PDF.

### Alterações

**9 ficheiros a modificar:**

**1. `src/components/shared/icons.tsx`**
- Remover `className` prop de todos os 4 componentes (IconCalendar, IconClock, IconMapPin, LogoMemoralis)
- Normalizar todos os SVGs para dimensões fixas inline: `style={{ width: "13px", height: "13px", flexShrink: 0 }}` (calendar/clock/map-pin) e `style={{ width: "100%", height: "100%" }}` (LogoMemoralis)
- Manter `viewBox` e `fill` inalterados

**2. `src/components/ObituaryTemplate/ObituaryTemplate.tsx`**
Converter ~25 usos de `className` para inline style:
- `className="bg-white relative overflow-hidden"` → `style={{ background: "#fff", position: "relative", overflow: "hidden", ... }}`
- `className="absolute overflow-clip"` → `style={{ position: "absolute", overflow: "hidden", ... }}`
- `className="absolute rounded-[30px] overflow-hidden"` → `style={{ position: "absolute", borderRadius: "30px", overflow: "hidden", ... }}`
- `className="flex items-center"` → `style={{ display: "flex", alignItems: "center", ... }}`
- `className="shrink-0 overflow-clip"` → `style={{ flexShrink: 0, overflow: "hidden" }}`
- `className="shrink-0 not-italic whitespace-nowrap"` → `style={{ flexShrink: 0, fontStyle: "normal", whiteSpace: "nowrap", ... }}`
- `className="absolute not-italic"` → `style={{ position: "absolute", fontStyle: "normal", ... }}`
- `className="absolute flex flex-col items-start not-italic"` → `style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "flex-start", fontStyle: "normal", ... }}`
- `className="absolute not-italic whitespace-pre-wrap"` → `style={{ position: "absolute", fontStyle: "normal", whiteSpace: "pre-wrap", ... }}`
- `className="w-full"` → `style={{ width: "100%" }}`
- Placeholders (foto vazia, QR vazio) com `className="w-full h-full bg-gray-200 flex ..."` → tudo inline

**3. `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx`**
Mesma conversão — ~20 usos de `className` convertidos para inline style.

**4. `src/components/ObituaryTemplate/types.ts`** — sem alterações (já puro)
**5. `src/components/SeventhDayMassTemplate/types.ts`** — sem alterações
**6. `src/components/ObituaryTemplate/index.ts`** — sem alterações
**7. `src/components/SeventhDayMassTemplate/index.ts`** — sem alterações
**8. `src/components/ObituaryPreview.tsx`** — sem alterações (className aqui é para o wrapper UI, não para o template capturado)
**9. `src/components/SeventhDayMassPreview.tsx`** — sem alterações

**10. `src/components/obituaries/AnnouncementGenerator.tsx`** (linha 280-288)
Adicionar `windowWidth: 595` e `windowHeight: 842` ao `html2canvas`:
```typescript
const canvas = await html2canvas(element, {
  scale: 2,
  backgroundColor: "#ffffff",
  useCORS: true,
  allowTaint: false,
  logging: false,
  width: 595,
  height: 842,
  windowWidth: 595,
  windowHeight: 842,
});
```

### Mapeamento Tailwind → inline style

| className | style inline |
|---|---|
| `absolute` | `position: "absolute"` |
| `relative` | `position: "relative"` |
| `overflow-hidden` / `overflow-clip` | `overflow: "hidden"` |
| `bg-white` | `background: "#ffffff"` |
| `rounded-[30px]` | `borderRadius: "30px"` |
| `flex` | `display: "flex"` |
| `flex-col` | `flexDirection: "column"` |
| `items-center` | `alignItems: "center"` |
| `items-start` | `alignItems: "flex-start"` |
| `justify-center` | `justifyContent: "center"` |
| `shrink-0` | `flexShrink: 0` |
| `not-italic` | `fontStyle: "normal"` |
| `whitespace-nowrap` | `whiteSpace: "nowrap"` |
| `whitespace-pre-wrap` | `whiteSpace: "pre-wrap"` |
| `w-full` | `width: "100%"` |
| `h-full` | `height: "100%"` |
| `gap-*` | já inline via `style={{ gap }}` |

### Resultado esperado
- Templates 100% inline — `html2canvas` renderiza layout fielmente
- `windowWidth/windowHeight` garante que html2canvas simula viewport de 595px
- Nenhuma dependência de Tailwind CSS dentro dos templates capturados para PDF

