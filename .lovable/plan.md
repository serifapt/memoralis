

## Alterar grelha de obituários para 3 colunas

Na página `src/pages/Obituaries.tsx`, alterar as duas instâncias de `grid-cols-1 lg:grid-cols-2` para `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, tanto na grelha principal como nos skeletons de carregamento (adicionar um 3º skeleton).

### Ficheiro a alterar
- `src/pages/Obituaries.tsx` — linhas com `grid-cols-1 lg:grid-cols-2` → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

