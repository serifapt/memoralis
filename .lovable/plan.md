

## Corrigir entrelinha do nome da funerária

O `lineHeight: '0.8'` está aplicado ao `<span>`, mas como é um elemento inline dentro de um `<a>`, o line-height não tem efeito visível na quebra de linha. A solução é mover o estilo para o `<Link>` (elemento pai) e adicionar `display: inline-block` ou `block` ao span.

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

**Linha 89**: Adicionar `style={{ lineHeight: '0.8' }}` ao `<Link>` e remover do `<span>`.

```tsx
<Link
  to={obit.funerarias.slug ? `/funerarias/${obit.funerarias.slug}` : "#"}
  onClick={(e) => e.stopPropagation()}
  className="text-muted-foreground hover:text-primary transition-colors mt-auto"
  style={{ lineHeight: '0.8' }}
>
  <span className="text-xs hover:underline">{obit.funerarias.nome_comercial}</span>
</Link>
```

