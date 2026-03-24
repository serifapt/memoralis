

## Plano: Corrigir botões "Guardar" e "Adicionar Secção" no orçamento

### Diagnóstico

Analisei o código de `BudgetQuoteDetail.tsx` e `useBudgetQuotes.ts` e identifiquei dois problemas:

1. **Botão "Adicionar Secção"** — só aparece quando `!isNew` (linha 604). Na página `/budgets/new`, o botão é invisível por design. Depois de guardar, o `navigate` muda a rota, mas o botão pode não aparecer se o estado não recarregar correctamente.

2. **Botão "Guardar"** — chama `handleSave` que internamente chama `createQuote`. Esta função chama `fetchFunerariaId()` que pode retornar `null` silenciosamente se o utilizador não tiver uma funerária associada, e o erro é engolido sem feedback claro. Além disso, o `useEffect` que carrega os dados depende de `getQuoteById` (um `useCallback`), o que pode causar re-execuções desnecessárias e estados instáveis.

### Alterações em `src/pages/BudgetQuoteDetail.tsx`

#### 1. Adicionar logs de diagnóstico temporários no `handleSave`
Para confirmar a causa exacta, adicionar `console.log` em pontos chave do fluxo de save.

#### 2. Melhorar tratamento de erros no `handleSave`
- Verificar se `createQuote` retorna `null` e mostrar toast de erro explícito
- Adicionar `try/catch` mais robusto com feedback ao utilizador

#### 3. Estabilizar dependências do `useEffect`
- Remover `getQuoteById` das dependências do `useEffect` de carregamento
- Usar uma ref ou chamar directamente dentro do efeito para evitar re-execuções

### Alterações em `src/hooks/useBudgetQuotes.ts`

#### 4. Melhorar `createQuote` com feedback de erros
- Se `fetchFunerariaId` retorna `null`, mostrar toast com mensagem clara ("Funerária não encontrada — verifique que a sua conta está associada")
- Garantir que erros do RPC `get_next_quote_number` são reportados

### Resultado esperado
- O botão "Guardar" cria o orçamento e navega para a página de edição onde "Adicionar Secção" aparece
- Se algo falhar, o utilizador vê uma mensagem de erro clara

### Ficheiros a alterar
- `src/pages/BudgetQuoteDetail.tsx`
- `src/hooks/useBudgetQuotes.ts`

