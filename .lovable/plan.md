

## Centrar informação de localidade e funerária nos cards

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

Adicionar `justify-center` às divs da localidade (linha 69) e da funerária (linha 78) para centrar horizontalmente o conteúdo no espaço disponível do card.

- Linha 69: `flex items-center gap-2` → `flex items-center justify-center gap-2`
- Linha 78: `flex items-center gap-1.5` → `flex items-center justify-center gap-1.5`

### Ficheiro editado
1. `src/components/obituaries/PublicObituaryCard.tsx`

