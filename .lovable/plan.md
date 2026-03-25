

## Plano: Corrigir bug no TimeInput — segundo dígito não funciona

### Causa raiz

Quando o utilizador digita o primeiro número (ex: "0"), a função `emit` faz `padStart(2, "0")` imediatamente, transformando "0" em "00". O valor `hh` passa a "00" e como o campo tem `maxLength={2}`, o segundo dígito não consegue ser introduzido — o campo já está "cheio".

### Solução

Usar **estado local** (`useState`) para os valores brutos dos campos HH e MM, em vez de derivar directamente do `value` prop (que já vem padded). Assim:

- O utilizador digita "0" → estado local fica "0" → campo mostra "0" → pode digitar o segundo dígito
- O utilizador digita "09" → auto-advance para minutos + `emit("09", "00")` para o parent
- Só chamar `emit` (com padding) quando os 2 dígitos estão completos ou no `onBlur`
- Sincronizar o estado local quando o `value` prop muda externamente

### Alteração no ficheiro `src/components/ui/time-input.tsx`

1. Substituir `useMemo` por dois `useState` para `localHH` e `localMM`
2. `useEffect` para sincronizar estado local quando `value` prop muda (ex: carregamento de dados)
3. `handleHourChange`: actualizar estado local; só chamar `emit` quando `v.length === 2`
4. `handleMinuteChange`: actualizar estado local; só chamar `emit` quando `v.length === 2`
5. `onBlur` em ambos os inputs: fazer pad e `emit` do valor actual (para garantir formato correcto ao sair do campo)
6. Remover `padStart` prematuro do fluxo de digitação

