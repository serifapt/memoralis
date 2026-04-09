

## Reduzir espaço entre linhas no card (desktop)

### Alterações em `src/components/obituaries/PublicObituaryCard.tsx`

O problema é o `space-y-3` no `CardContent` (linha 66) e o `flex-1` no div interior (linha 67/84) que expande o espaço entre a localidade e o nome da funerária.

**Correções:**
1. **Linha 66**: Reduzir `space-y-3` para `space-y-2` no CardContent
2. **Linha 66**: Reduzir padding de `p-4` para `p-3`
3. **Linha 84**: Remover `flex-1` do div da funerária — usar apenas `mt-1` para um pequeno espaço controlado em vez de expandir
4. **Linha 67**: Manter `flex-1` apenas no div exterior para que o card continue a ocupar a altura total, mas o espaço extra fica antes dos botões (não entre localidade e funerária)
5. **Linha 125**: Reduzir `pt-3` para `pt-2` nos contadores

Resultado: espaçamento mais compacto e consistente entre localidade e nome da funerária.

