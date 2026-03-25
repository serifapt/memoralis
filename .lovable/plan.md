

## Plano: Melhorar inputs de horas no processo de óbito

### Objectivo
Substituir os inputs nativos `type="time"` por um componente mais user-friendly usando `Select` com opções de horas (00:00–23:30, intervalos de 30 min), ou um input estilizado com ícone de relógio (`Clock`) e comportamento `onFocus` → `select()`.

### Alterações em `src/pages/NewObituary.tsx`

Existem **7 inputs de hora** espalhados pelo formulário:
- `deathTime` (linha ~1327)
- `entry.time` nos velórios (linha ~1492)
- `funeralTime` (linha ~1578)
- `cremacaoTime` (linha ~1678)
- `missa7Time` (linha ~1769)
- `missa30Time` (linha ~1835)
- `missa1anoTime` (linha ~1901)

**Abordagem**: Envolver cada input `type="time"` com um wrapper que adiciona o ícone `Clock` à esquerda (similar ao `CalendarIcon` nos date pickers) e `onFocus={(e) => e.target.select()}` para seleccionar automaticamente o valor ao clicar.

Concretamente:
1. Adicionar `Clock` aos imports de `lucide-react`
2. Envolver cada `<Input type="time">` num `div` relativo com ícone `Clock` posicionado à esquerda e padding-left no input
3. Adicionar `onFocus={(e) => e.target.select()}` a cada input de hora
4. Adicionar `className` com `pl-9` para dar espaço ao ícone

### Ficheiro a alterar
- `src/pages/NewObituary.tsx`

