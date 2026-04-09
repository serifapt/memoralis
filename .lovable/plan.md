

## Corrigir campos de data que não persistem o valor selecionado

### Problema identificado
Ao analisar o código em `src/pages/NewObituary.tsx`, encontrei uma **race condition** na primeira gravação automática de um obituário novo:

1. O auto-save insere o obituário na BD e faz `navigate(/obituaries/${id}/edit, { replace: true })` (linha 1123)
2. O `navigate` altera o `id` nos params, o que faz o `useEffect` de carregamento (linha 434) re-executar
3. Este efeito recarrega TODOS os dados do formulário a partir da BD — mas as ceremony events (datas de funeral, missa, etc.) **ainda não foram gravadas** (linhas 1127-1195 executam DEPOIS do navigate)
4. O `isInitialLoadRef` já foi definido como `false` no mount inicial, por isso o auto-save pode voltar a disparar com dados parciais

Resultado: as datas selecionadas pelo utilizador são substituídas por valores vazios vindos da BD.

### Solução

No ficheiro `src/pages/NewObituary.tsx`:

1. **Mover o `navigate` para DEPOIS de gravar as ceremony events** — garantir que todos os dados (obituário + eventos) estão na BD antes de alterar o URL. Mover a chamada `navigate(...)` da linha 1123 para depois do bloco de inserção de eventos (após linha 1195).

2. **Definir `isInitialLoadRef.current = true` ANTES do navigate** — para que quando o `loadObituaryData` effect disparar (após mudança de `id`), o auto-save effect ignore essa mudança de formData como se fosse um carregamento inicial.

3. **Evitar recarregamento desnecessário**: como os dados já estão no state do componente, adicionar uma condição no `loadObituaryData` effect para não re-executar se `savedObituaryIdRef.current` já corresponde ao `id` (ou seja, o componente já tem os dados corretos do obituário que acabou de criar).

### Ficheiro a alterar
- `src/pages/NewObituary.tsx`

### Resumo
- Mover `navigate()` para depois de gravar todos os dados (incluindo eventos de cerimónia)
- Proteger o efeito de carregamento contra re-execuções desnecessárias após o primeiro auto-save
- Resetar `isInitialLoadRef` antes do navigate para bloquear auto-save espúrio

