

## Plano: Tab "Pendentes" primeiro quando há pendentes

### Alteração em `src/pages/AdminFunerarias.tsx`

1. Ao carregar, fazer uma query rápida para contar funerárias com `status = 'pendente'`
2. Se `count > 0`, definir o estado inicial do filtro como `"pendente"` em vez de `"todos"`
3. Implementar com um `useEffect` inicial que verifica a contagem e define o `filter` antes do primeiro carregamento de dados

Alternativa mais simples: carregar todas as funerárias uma vez no mount, verificar se alguma é pendente, e se sim mudar o tab para "pendente". Isto evita uma query extra.

### Implementação
- No `useEffect` inicial, fazer `supabase.from("funerarias").select("id", { count: "exact" }).eq("status", "pendente")`
- Se count > 0, chamar `setFilter("pendente")` — o que vai disparar o `useEffect` existente que carrega os dados filtrados
- Adicionar um estado `initialCheckDone` para evitar carregar dados antes de saber o tab correto

### Ficheiro
- **Editar**: `src/pages/AdminFunerarias.tsx`

