

## Corrigir hover do ClientSelector para vermelho (primário)

### Problema
O `CommandItem` usado no dropdown de clientes aplica `bg-accent` (dourado) no hover/seleção, enquanto os outros selects da app usam vermelho (`bg-primary`).

### Solução
No `ClientSelector.tsx`, passar uma className ao `CommandItem` para sobrepor o estilo de hover/seleção com as cores primárias (vermelho), mantendo consistência com os outros selects.

### Alteração

**`src/components/clients/ClientSelector.tsx`**:
- Adicionar className ao `CommandItem` para usar `data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground` em vez do accent dourado

### Ficheiro editado
1. `src/components/clients/ClientSelector.tsx`

