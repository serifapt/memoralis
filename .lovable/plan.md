

## Reduzir ainda mais o espaçamento entre linhas do nome da funerária

O `leading-none` atual já define `line-height: 1`. Para reduzir mais, usaremos um valor arbitrário do Tailwind.

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 91**: Alterar `leading-none` para `leading-[0.9]` no `<span>` do nome da funerária:

```tsx
<span className="text-xs leading-[0.9] hover:underline mx-0">
```

Isto reduz a altura de linha para 0.9, comprimindo o espaço entre linhas quando o nome da funerária ocupa mais do que uma linha.

