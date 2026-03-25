

## Plano: Melhorar inputs de datas e valores no orçamento

### Alterações em `src/pages/BudgetQuoteDetail.tsx`

1. **Inputs de data (linhas 563, 571)** — Substituir os `<Input type="date">` nativos por date pickers com Popover + Calendar (padrão Shadcn), usando `format(date, "dd/MM/yyyy")` para exibição em formato português. Importar `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, `CalendarIcon` e `format`/`parse` do date-fns.

2. **Inputs de valores numéricos (linhas 613, 619, 622)** — Adicionar `onFocus={(e) => e.target.select()}` aos inputs de quantidade, preço unitário e desconto para que ao clicar no input o valor existente fique automaticamente seleccionado, pronto para ser substituído. Isto evita que o utilizador tenha de apagar manualmente o "0" antes de escrever.

3. **Tratamento de valor vazio** — Nos inputs de preço e desconto, quando o valor é `0`, mostrar string vazia como placeholder visual para não confundir. Ao perder foco (onBlur), se vazio, repor `0`.

### Ficheiro a alterar
- `src/pages/BudgetQuoteDetail.tsx`

