

## Plano: Substituir templates de anúncio funerário pela versão Figma pixel-perfect

### Resumo
Substituir os templates antigos (`ObituaryTemplateA4`, `SeventhDayMassTemplate`, ícones) pelos novos ficheiros uploaded, e actualizar o `AnnouncementGenerator.tsx` para usar os novos componentes e props.

### Ficheiros a criar (9 — conteúdo exacto dos uploads)

| Ficheiro | Origem (upload) |
|---|---|
| `src/components/shared/icons.tsx` | `icons-2.tsx` |
| `src/components/ObituaryTemplate/types.ts` | `types-2.ts` |
| `src/components/ObituaryTemplate/ObituaryTemplate.tsx` | `ObituaryTemplate.tsx` |
| `src/components/ObituaryTemplate/index.ts` | `index-2.ts` |
| `src/components/SeventhDayMassTemplate/types.ts` | `types-3.ts` (substitui o existente) |
| `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx` | `SeventhDayMassTemplate-2.tsx` (substitui o existente) |
| `src/components/SeventhDayMassTemplate/index.ts` | `index-3.ts` (substitui o existente) |
| `src/components/ObituaryPreview.tsx` | `ObituaryPreview.tsx` |
| `src/components/SeventhDayMassPreview.tsx` | `SeventhDayMassPreview-2.tsx` (substitui o existente) |

### Ficheiros a apagar

| Ficheiro | Razão |
|---|---|
| `src/components/obituaries/ObituaryTemplateA4.tsx` | Substituído por `ObituaryTemplate/` |
| `src/components/obituaries/ObituaryTypes.ts` | Substituído por `ObituaryTemplate/types.ts` |
| `src/components/obituaries/ObituaryIcons.tsx` | Substituído por `shared/icons.tsx` |
| `src/components/SeventhDayMassTemplate/icons.tsx` | CrossSymbol já não é usado |

### Ficheiros a actualizar

**1. `src/components/obituaries/AnnouncementGenerator.tsx`**
- Substituir import de `ObituaryTemplateA4` → `ObituaryTemplate` de `@/components/ObituaryTemplate`
- Substituir import de `SeventhDayMassTemplate` de `@/components/SeventhDayMassTemplate`
- Adicionar campos `cortejoDate`, `cortejoTime`, `cortejoLocation` à interface `obituaryData`
- Remover `convertToGrayscale` (grayscale é agora aplicado via CSS `filter: grayscale(100%)` no template)
- Actualizar `renderPreview()` para passar props no novo formato:
  - `velorio` como objecto `{ date, startTime, endTime, location }`
  - `funeral` como objecto `{ date, time, location }`
  - `cemetery` como objecto `{ location }`
  - `cortejoFunebre` como objecto `{ date, startTime, endTime, location }` (novo)
  - Usar `photo` directamente (sem grayscale manual)

**2. `index.html`**
- Google Fonts Inter e Roboto já estão incluídos — nenhuma alteração necessária.

### Secção técnica

Mapeamento de props antigo → novo no `renderPreview()`:

```text
ANTES (ObituaryTemplateA4)          DEPOIS (ObituaryTemplate)
─────────────────────────           ─────────────────────────
fullName                         →  fullName
photo (grayscale manual)         →  photo (CSS grayscale)
age, birthYear, deathYear        →  age, birthYear, deathYear
parish, municipality             →  parish, municipality
deathCountry (toUpperCase)       →  deathCountry
familyText                       →  familyText
wake={{ date, startTime, ... }}  →  velorio={{ date, startTime, ... }}
funeral={{ date, time, ... }}    →  funeral={{ date, time, ... }}
cemetery={{ location }}          →  cemetery={{ location }}
(não existia)                    →  cortejoFunebre={{ date, startTime, endTime, location }}
qrCodeImage                      →  qrCodeImage
funeralHomeLogo                  →  funeralHomeLogo
phone1, phone2, email, website   →  phone1, phone2, email, website
flowerImage                      →  flowerImage
```

