

## Reduzir altura de linha do nome no card de obituário

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 62**: Adicionar `leading-tight` ao `<h3>` do nome para reduzir o line-height.

```
font-archivo font-bold text-foreground text-lg mb-1
→ font-archivo font-bold text-foreground text-lg mb-1 leading-tight
```

### Ficheiro editado
1. `src/components/obituaries/PublicObituaryCard.tsx`

