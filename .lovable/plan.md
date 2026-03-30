

## Plano: Capitalizar etiquetas de eventos + Novo tipo "Cortejo Fúnebre"

### 1. Capitalizar as etiquetas de todos os event types

Atualizar os mapas de labels em **4 ficheiros** para usar inicial maiúscula consistente:

- **`src/lib/ceremony-utils.ts`** — `TAG_LABELS`: adicionar `velorio: "Velório"` e `cemiterio: "Cemitério"` (e `cortejo`)
- **`src/pages/ObituaryDetail.tsx`** — `getEventTypeLabel()`: já tem maiúsculas, adicionar `cortejo: "Cortejo Fúnebre"`
- **`src/pages/Ceremonies.tsx`** — `getEventTypeLabel()`: já tem maiúsculas, adicionar `cortejo: "Cortejo Fúnebre"`

O screenshot mostra "cemiterio" em minúsculas — isto acontece porque o `event_type` guardado na BD é `cemiterio` (sem acento) e os mapas de labels não o incluem, pelo que faz fallback para o valor raw. Corrigir adicionando `cemiterio: "Cemitério"` em todos os mapas.

### 2. Adicionar novo evento "Cortejo Fúnebre" no editor de óbitos

No **`src/pages/NewObituary.tsx`**:

- Adicionar estado toggle `cortejo` + `cortejoEntries` (array com múltiplas entradas, igual ao velório)
- Adicionar funções `addCortejoEntry`, `removeCortejoEntry`, `updateCortejoEntry`
- No carregamento de dados existentes, filtrar `event_type === 'cortejo'` e popular as entries
- No save (tanto no handleSubmit como no auto-save), inserir eventos com `event_type: 'cortejo'`
- No UI (secção "Informações Fúnebres"), adicionar bloco entre Velório e Funeral com os mesmos inputs: Data, Hora, Local, Link do mapa — com suporte a múltiplas entradas

### 3. Atualizar labels em todos os mapas

Adicionar `cortejo: "Cortejo Fúnebre"` e `cemiterio: "Cemitério"` nos 3 ficheiros com mapas de labels:
- `ceremony-utils.ts` (TAG_LABELS)
- `ObituaryDetail.tsx` (getEventTypeLabel)
- `Ceremonies.tsx` (getEventTypeLabel)

### Ficheiros a alterar
1. `src/pages/NewObituary.tsx` — estado, UI, load, save do novo tipo cortejo
2. `src/lib/ceremony-utils.ts` — labels
3. `src/pages/ObituaryDetail.tsx` — labels
4. `src/pages/Ceremonies.tsx` — labels

Não são necessárias alterações à BD — o campo `event_type` é texto livre.

