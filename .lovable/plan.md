

## Substituir templates v3 — compatibilidade total html2canvas

### O que muda
Os 9 ficheiros uploaded substituem os existentes com templates reescritos que eliminam 3 incompatibilidades do html2canvas:
- `object-fit` → `background-image` + `background-size`
- `flex` + `gap` → `inline-block` + `vertical-align: middle` + `margin-top`
- `className` → tudo inline `style={{}}`

### Ficheiros a substituir (9 ficheiros)

| Ficheiro | Origem |
|---|---|
| `src/components/shared/icons.tsx` | `icons-4.tsx` |
| `src/components/ObituaryTemplate/ObituaryTemplate.tsx` | `ObituaryTemplate-3.tsx` |
| `src/components/ObituaryTemplate/types.ts` | `types-6.ts` |
| `src/components/ObituaryTemplate/index.ts` | `index-6.ts` |
| `src/components/ObituaryPreview.tsx` | `ObituaryPreview-3.tsx` |
| `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx` | `SeventhDayMassTemplate-4.tsx` |
| `src/components/SeventhDayMassTemplate/types.ts` | `types-7.ts` |
| `src/components/SeventhDayMassTemplate/index.ts` | `index-7.ts` |
| `src/components/SeventhDayMassPreview.tsx` | `SeventhDayMassPreview-4.tsx` |

### AnnouncementGenerator.tsx
Sem alterações necessárias — já tem a configuração correcta do html2canvas com `windowWidth: 595` e `windowHeight: 842`.

### Secção técnica

Padrões v3 aplicados nos templates:

```text
ANTES (v2)                          DEPOIS (v3)
─────────────────────────────────   ─────────────────────────────────
<img src={photo}                    <div style={{
  style={{ objectFit: "cover" }}      backgroundImage: `url(${photo})`,
/>                                    backgroundSize: "cover",
                                      backgroundPosition: "center 20%",
                                    }} />

<div style={{                       <div style={{ lineHeight: "17px",
  display: "flex",                    marginTop: "4px" }}>
  gap: "4px",                       <span style={{
  alignItems: "center"                display: "inline-block",
}}>                                   verticalAlign: "middle" }}>
  <Icon />                            <Icon />
  <span>text</span>                 </span>
</div>                              <span>text</span></div>

<svg className="w-[13px]..."        <svg style={{
  style={style}>                      display: "inline-block",
                                      verticalAlign: "middle",
                                      width: "13px", height: "13px"
                                    }}>
```

