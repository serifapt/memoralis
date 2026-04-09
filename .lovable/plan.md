

## Problema

Quando o utilizador muda de tab no browser e volta, o Supabase Auth pode disparar um evento `SIGNED_IN` (após refresh do token). O `ProtectedRoute` reage a esse evento chamando `fetchRolesForSession`, que faz `setLoading(true)` — isto desmonta todos os componentes filhos (incluindo formulários com dados) e mostra "A carregar...", perdendo toda a informação introduzida.

## Solução

Alterar o `ProtectedRoute` para **não re-renderizar o loading** quando já tem uma sessão válida e roles verificados. A lógica será:

### Alteração em `src/components/auth/ProtectedRoute.tsx`

1. **Não fazer `setLoading(true)` quando já há sessão e roles verificados** — só mostrar loading no carregamento inicial
2. Adicionar uma flag `initialLoadDone` que distingue o primeiro carregamento (onde temos de mostrar loading) de re-verificações posteriores (onde mantemos os filhos montados enquanto re-verificamos em background)
3. Na função `fetchRolesForSession`, só chamar `setLoading(true)` se `initialLoadDone` for `false`
4. Após a primeira verificação bem-sucedida, marcar `initialLoadDone = true`

### Resultado
- Primeiro acesso: mostra "A carregar..." até verificar sessão e roles
- Mudança de tab e regresso: a re-verificação acontece silenciosamente em background, sem desmontar os componentes filhos — os dados do formulário são preservados

