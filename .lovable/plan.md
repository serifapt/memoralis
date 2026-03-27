

## Corrigir tipografia do TimeInput

### Problema
O `TimeInput` usa `font-mono` (monospace) nos campos internos e no separador `:`, enquanto todos os outros inputs usam a fonte padrão (Inter). Isto cria uma inconsistência visual.

### Solução
Remover `font-mono` da variável `baseInput` e do separador `:` no ficheiro `src/components/ui/time-input.tsx`.

### Alteração

**`src/components/ui/time-input.tsx`**:
- Linha do `baseInput`: remover `font-mono`
- Linha do `<span>` separador: remover `font-mono`

