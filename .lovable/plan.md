

## Reordenar contadores e corrigir botões no mobile

### Alterações em `src/components/obituaries/PublicObituaryCard.tsx`

**1. Mover contadores para baixo dos botões**
- Trocar a ordem dos blocos: primeiro os botões de ação, depois os contadores
- Adicionar um separador (`border-t pt-3`) acima dos contadores, como no screenshot
- Espaçar os contadores com `justify-between` em vez de `gap-4` para distribuir uniformemente

**2. Corrigir botões no mobile**
- Reduzir o texto dos botões em mobile: usar `text-[10px] sm:text-xs` e `h-7 sm:h-8`
- Reduzir padding: `px-1.5 sm:px-2`
- Garantir `min-w-0` + `truncate` para que o texto não transborde

