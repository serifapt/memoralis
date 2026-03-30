

## Alinhar localidade e funerária à esquerda

Remover `justify-center` das linhas 70 e 79, mantendo o centramento vertical (`flex-1 flex flex-col justify-center` no wrapper) mas com texto alinhado à esquerda como o nome e datas.

### Alterações em `src/components/obituaries/PublicObituaryCard.tsx`

- **Linha 70**: `flex items-center justify-center gap-2` → `flex items-center gap-2`
- **Linha 79**: `flex items-center justify-center gap-1.5` → `flex items-center gap-1.5`

### Ficheiro editado
1. `src/components/obituaries/PublicObituaryCard.tsx`

