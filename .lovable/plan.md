

## Não mostrar tag de funeral/cremação se a data já passou

### Alteração em `src/lib/ceremony-utils.ts`

Na função `getActiveTag`, o bloco que verifica `primaryTypes` (funeral/cremação) atualmente mostra a tag se o evento tiver `event_date` ou `location` preenchidos, **independentemente de a data já ter passado**.

**Correção**: adicionar verificação temporal — só mostrar a tag de funeral/cremação se:
- O evento **não tiver data** (manter tag porque não sabemos se passou), OU
- A data do evento **ainda não passou** (>= hoje)

Se a data já passou e não houver missa futura, retorna `null` (sem tag).

### Ficheiro editado
1. `src/lib/ceremony-utils.ts` — adicionar check de data passada no bloco `primaryEvent`

