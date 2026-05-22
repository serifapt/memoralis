**Objetivo**: Remover o acesso público às páginas `/floristas` e `/missas`, mantendo o código-fonte das páginas intacto para reativação futura.

**Alterações necessárias:**

1. **`src/App.tsx`**
   - Remover os imports de `Floristas` e `Missas`.
   - Remover as `<Route path="/floristas" ... />` e `<Route path="/missas" ... />`.

2. **`src/components/layout/PublicHeader.tsx`**
   - Remover os itens `Floristas` e `Missas` do array `NAV_LINKS`, deixando de os renderizar tanto no desktop como no menu mobile.

**Não será alterado:**
- Os ficheiros `src/pages/Floristas.tsx`, `src/pages/Missas.tsx` e `src/components/public/ComingSoonPage.tsx` ficam intactos para futura reativação.