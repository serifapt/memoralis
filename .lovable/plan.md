

## Plano: Botão dinâmico "Criar/Ver Orçamento" no processo de óbito

### Objectivo
Quando existem orçamentos associados ao óbito, o botão muda de "Criar Orçamento" para "Ver Orçamento". Se houver mais do que um, ao clicar aparece um popover/dropdown para o utilizador escolher qual visualizar. Se houver apenas um, navega directamente.

### Alterações em `src/pages/NewObituary.tsx`

1. **Consultar orçamentos associados** — Adicionar um `useEffect` que faz query à tabela `budget_quotes` filtrando por `obituary_id` igual ao ID do óbito actual. Guardar o resultado num estado `linkedQuotes` (array com `id`, `quote_number`, `status`, `created_at`).

2. **Lógica condicional do botão**:
   - Se `linkedQuotes.length === 0` → manter botão "Criar Orçamento" (comportamento actual)
   - Se `linkedQuotes.length === 1` → botão "Ver Orçamento" que navega directamente para `/budgets/{id}`
   - Se `linkedQuotes.length > 1` → botão "Ver Orçamento" que abre um `Popover` com a lista dos orçamentos (número, estado, data) para o utilizador escolher

3. **Manter opção de criar novo** — No popover com múltiplos orçamentos, adicionar um separador e a opção "Criar Novo Orçamento" no fim da lista.

4. **Imports adicionais**: `Popover`, `PopoverTrigger`, `PopoverContent` de `@/components/ui/popover`, e `ChevronDown`/`ExternalLink` de lucide-react.

### Ficheiro a alterar
- `src/pages/NewObituary.tsx`

