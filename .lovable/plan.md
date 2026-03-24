

## Plano: Corrigir nomes dos tipos de cerimónia

### Problema
Na linha 287 de `ObituaryDetail.tsx`, o `event.event_type` é exibido em bruto (ex: "velorio", "funeral") em vez dos nomes formatados ("Velório", "Funeral").

### Alteração em `src/pages/ObituaryDetail.tsx`

Adicionar uma função de mapeamento e usá-la na linha 287:

```typescript
const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    velorio: "Velório",
    missa: "Missa",
    cremacao: "Cremação",
    sepultamento: "Sepultamento",
    funeral: "Funeral",
    outro: "Outro",
  };
  return labels[type] || type;
};
```

Na linha 287, substituir `{event.event_type}` por `{getEventTypeLabel(event.event_type)}`.

