

## Plano: Ajustar estilos dos badges e dropdown de estado

### Alterações

**2 ficheiros**: `src/pages/BudgetQuotes.tsx` e `src/pages/BudgetQuoteDetail.tsx`

1. **Remover hover dos badges de estado** — tirar `hover:opacity-80 transition-opacity` dos badges trigger (tanto na lista como no detalhe)
2. **Hover vermelho (primary) nos itens do dropdown** — adicionar classe `focus:bg-primary/10 focus:text-primary` aos `DropdownMenuItem` do selector de estado, para que o hover use o vermelho/coral do projecto em vez do cinza padrão

### Detalhes técnicos

- Badge trigger: `cursor-pointer` mantém-se, remove-se apenas `hover:opacity-80 transition-opacity`
- Badges dentro do dropdown (opções): também sem hover, mantêm cor fixa
- `DropdownMenuItem`: adicionar `className="focus:bg-primary/10 focus:text-primary"` para consistência com os botões ghost do projecto

