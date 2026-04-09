

## Aumentar margem entre localidade e nome da funerária

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 89**: Substituir `mt-auto` por `mt-auto pt-1` no `<Link>` da funerária, adicionando um pequeno padding-top para criar mais espaço entre a localidade e o nome da funerária.

```tsx
className="text-muted-foreground hover:text-primary transition-colors mt-auto pt-1"
```

