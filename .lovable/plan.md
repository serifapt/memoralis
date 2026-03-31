

## Plano: Adicionar template "Missa 7º Dia" (A4-3)

### Ficheiros a criar

1. **`src/components/SeventhDayMassTemplate/types.ts`** — tipos do template (conteúdo exacto do upload)

2. **`src/components/SeventhDayMassTemplate/icons.tsx`** — `CrossSymbol` (conteúdo exacto do upload)

3. **`src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx`** — template A4 595×842 (conteúdo do upload, com import path corrigido: `../obituaries/ObituaryIcons` em vez de `../ObituaryTemplate/icons`)

4. **`src/components/SeventhDayMassTemplate/index.ts`** — barrel exports (conteúdo exacto do upload)

5. **`src/components/SeventhDayMassPreview.tsx`** — preview escalado + dados demo (conteúdo do upload, com import path corrigido)

### Ajuste de imports

O código uploaded importa de `../ObituaryTemplate/icons` mas no projecto os ícones estão em `src/components/obituaries/ObituaryIcons.tsx`. O import será corrigido para:
```ts
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../obituaries/ObituaryIcons";
```

### Sem alterações a ficheiros existentes

O template é autocontido. A integração no `AnnouncementGenerator` (para gerar PDF com este template quando `announcementType === "missa_7"`) pode ser feita num passo posterior.

