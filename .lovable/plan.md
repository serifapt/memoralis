

## Plano: Adicionar tooltips aos botões dos formulários da Segurança Social

### Alteração

No ficheiro `src/components/obituaries/DocumentsTab.tsx`, envolver os dois últimos botões de cada card (linhas ~728-751) com componentes `Tooltip` para mostrar descrições ao passar o rato:

1. **Botão "Download modelo"** (linha 728-735): Tooltip com "Descarregar modelo em branco"
2. **Botão "Documento gerado"** (linha 737-751): Tooltip com "Descarregar documento preenchido"

Usar os componentes `Tooltip`, `TooltipTrigger` e `TooltipContent` já importáveis de `@/components/ui/tooltip`. O `TooltipProvider` já existe no `App.tsx`.

### Ficheiro
- `src/components/obituaries/DocumentsTab.tsx`

