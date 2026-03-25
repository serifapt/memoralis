

## Plano: Melhorar inputs de hora

### Problema actual

Os campos de hora usam `<input type="time">` nativo do browser, que:
- Mostra formato AM/PM (confuso para Portugal, onde se usa 24h)
- A experiência de edição é inconsistente entre browsers
- Não há validação visual nem formato claro
- O utilizador tem de navegar por spinners pequenos

### Solução

Criar um componente `TimeInput` dedicado que:
- Usa dois campos numéricos separados (HH e MM) com formato 24h
- Separados por `:` visual
- Cada campo aceita apenas 2 dígitos
- Auto-avança do campo HH para MM ao preencher 2 dígitos
- Valida intervalo (00-23 para horas, 00-59 para minutos)
- Mantém o ícone do relógio à esquerda
- Valor interno continua a ser string `"HH:MM"` para compatibilidade total com o código existente

### Ficheiros a alterar

1. **`src/components/ui/time-input.tsx`** (novo)
   - Componente com dois `<input>` numéricos side-by-side
   - Props: `value: string`, `onChange: (value: string) => void`, `className?: string`
   - Parse do valor `"HH:MM"` para dois campos
   - Auto-tab do HH para MM
   - Validação de limites

2. **`src/pages/NewObituary.tsx`**
   - Substituir os 7 blocos `<Input type="time">` pelo novo `<TimeInput>`
   - Remover os wrappers `relative` + ícone duplicado (o componente já inclui o ícone)
   - Campos afectados: deathTime, velório entries, funeralTime, cremacaoTime, missa7Time, missa30Time, missa1anoTime

### Resultado esperado
- Formato 24h nativo português
- Inserção rápida: digitar "0930" preenche "09:30" automaticamente
- Experiência consistente em todos os browsers
- Sem alteração ao formato de dados guardado

