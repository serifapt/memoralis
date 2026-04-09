
## Reduzir altura de linha do nome da funerária

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 91**: Alterar `leading-tight` para `leading-none` no `<span>` do nome da funerária, reduzindo a altura de linha de 1.25 para 1.

```tsx
// De:
<span className="text-xs leading-tight hover:underline">
// Para:
<span className="text-xs leading-none hover:underline">
```
