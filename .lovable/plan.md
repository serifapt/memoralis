

## Corrigir prioridade da tag de missa vs eventos primários

### Problema
Na função `getActiveTag` em `src/lib/ceremony-utils.ts`, as missas são verificadas **antes** dos eventos primários (funeral, cremação). Isto faz com que a tag "Missa 7º Dia" apareça mesmo quando o funeral ainda não aconteceu.

### Solução
Inverter a lógica: verificar primeiro se existem eventos primários (funeral, cremação, velório) com datas futuras. Se existirem e ainda não tiverem passado, mostrar a tag do evento primário. Só depois, se todos os eventos primários já tiverem passado (ou não existirem), verificar se há missas futuras para mostrar.

### Alteração no ficheiro `src/lib/ceremony-utils.ts`

Na função `getActiveTag`:
1. **Primeiro**: verificar se há eventos primários (funeral, cremação) com data futura — se sim, retornar essa tag
2. **Segundo**: só se não houver eventos primários futuros, verificar se há missas futuras (dentro de -2 dias a futuro) — se sim, retornar essa tag
3. Se nenhum dos dois, retornar `null`

Essencialmente, trocar a ordem dos dois blocos e ajustar a condição das missas para incluir a verificação de que os eventos primários já passaram.

### Ficheiro a alterar
- `src/lib/ceremony-utils.ts` — reordenar lógica na função `getActiveTag`

