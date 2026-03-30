

## Remover tag "Velório" e sem tag por defeito

### Alterações em `src/lib/ceremony-utils.ts`:

1. Remover `velorio` do `TAG_LABELS` e de `primaryTypes` — fica `["funeral", "cremacao"]`
2. Na função `getActiveTag`: após verificar missas futuras e funeral/cremação com campos preenchidos, retornar **`null`** (sem tag) se nenhum evento relevante for encontrado — **não há fallback para "Funeral"**
3. Remover `velorio` dos tag pills no `ObituaryArchive.tsx` se existir

### Ficheiros editados
1. `src/lib/ceremony-utils.ts`

