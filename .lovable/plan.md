

## Corrigir diálogos que fecham ao mudar de tab

### Problema identificado

O `ProtectedRoute` tem um bug de **stale closure** na variável `initialLoadDone`. O `useEffect` corre uma vez (dependência `[requireRole]`) e captura `initialLoadDone = false` no closure. Quando o utilizador muda de tab e volta, o Supabase pode disparar um evento `SIGNED_IN` (após refresh do token). A função `fetchRolesForSession` verifica `if (!initialLoadDone)` — mas como o closure tem o valor antigo (`false`), chama `setLoading(true)`, o que faz o ProtectedRoute renderizar o spinner "A carregar..." momentaneamente, **desmontando todos os componentes filhos** (incluindo diálogos abertos). Quando o loading termina, os filhos são remontados do zero — com os diálogos fechados.

### Solução

Usar um `useRef` para `initialLoadDone` em vez de `useState`, garantindo que o valor é sempre atual dentro do closure.

### Alteração

**`src/components/auth/ProtectedRoute.tsx`**:
- Substituir `const [initialLoadDone, setInitialLoadDone] = useState(false)` por `const initialLoadDoneRef = useRef(false)`
- Na linha 35, verificar `if (!initialLoadDoneRef.current)` em vez de `if (!initialLoadDone)`
- Nas linhas 30 e 76, fazer `initialLoadDoneRef.current = true` em vez de `setInitialLoadDone(true)`
- Importar `useRef` do React

Esta alteração garante que, após o carregamento inicial, o ProtectedRoute nunca mais mostra o spinner quando o Supabase dispara eventos de autenticação ao regressar ao tab, mantendo todos os componentes filhos (e diálogos) montados.

