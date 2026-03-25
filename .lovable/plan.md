

## Plano: Corrigir selecção automática nos inputs de hora

### Problema

O componente `TimeInput` já tem `onFocus={(e) => e.target.select()}` e lógica de auto-advance, mas em muitos browsers o `select()` é anulado pelo evento `mouseup` que ocorre após o `focus`. O texto não fica seleccionado ao clicar.

### Solução

No ficheiro `src/components/ui/time-input.tsx`:

1. **Adicionar `onMouseUp` com `preventDefault`** nos dois inputs para impedir que o browser desseleccione o texto após o click
2. **Usar `requestAnimationFrame`** no auto-advance (focus + select dos minutos) para garantir que a selecção acontece após o React actualizar o valor
3. Manter a lógica existente de `onFocus` com `select()`

### Alteração técnica

```tsx
// Em ambos os inputs, adicionar:
onMouseUp={(e) => e.preventDefault()}

// No auto-advance (handleHourChange), envolver em rAF:
requestAnimationFrame(() => {
  minuteRef.current?.focus();
  minuteRef.current?.select();
});
```

### Ficheiro
- `src/components/ui/time-input.tsx`

