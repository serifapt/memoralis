

## Redirecionar funerárias para Configurações no primeiro login

### Lógica
Quando um utilizador com role `funeraria` faz login, verificar se campos essenciais da funerária (morada, localidade, codigo_postal) estão preenchidos. Se não estiverem, redirecionar para `/settings` em vez de `/dashboard`.

### Alterações

**Ficheiro: `src/pages/Auth.tsx`**
Na função `redirectBasedOnRole`, quando `isFuneraria` é true:
1. Buscar os dados da funerária do utilizador (`morada`, `localidade`, `codigo_postal`)
2. Se algum destes campos estiver vazio/null → `navigate("/settings")`
3. Caso contrário → `navigate("/dashboard")` (comportamento atual)

Aplicar a mesma lógica no `checkSessionAndRedirect` (useEffect) que já faz redirect automático.

**Ficheiro: `src/pages/Auth.tsx` — checkSessionAndRedirect (useEffect)**
Mesma verificação: quando `isFuneraria`, consultar campos da funerária antes de decidir o destino.

### Sem alterações de base de dados
Usa apenas os campos já existentes na tabela `funerarias`.

