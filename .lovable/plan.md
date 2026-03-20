

## Plano: Aplicar tooltip com ícone Info aos campos restantes

### Campos a alterar em `src/pages/NewObituary.tsx`

1. **Nacionalidade** (linha 775): `Nacionalidade* (para documentos consulares)` → `Nacionalidade*` + tooltip "Para documentos consulares"
2. **Beneficiário** (linha 865): `Beneficiário (SNS ou CGA)*` → `Beneficiário*` + tooltip "SNS ou CGA"

### Detalhes técnicos
Mesmo padrão já usado nos campos NIF, Segurança Social e Cemitério: `Label` com `flex items-center gap-1.5`, ícone `Info` dentro de `Tooltip`/`TooltipProvider`.

