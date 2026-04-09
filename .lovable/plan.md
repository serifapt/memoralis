

## Reduzir espaçamento entre linhas do nome da funerária

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 91**: Adicionar `leading-tight` ao `<span>` do nome da funerária para reduzir o line-height quando o texto quebra em múltiplas linhas.

```tsx
<span className="text-xs hover:underline leading-tight">{obit.funerarias.nome_comercial}</span>
```

