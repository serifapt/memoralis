

## Plano: Tags nos cards, reordenação por cerimónias futuras, freguesia na funerária e logo 220px

### 1. Tags de cerimónia nos cards de obituário

**Lógica da tag**: Determinar o evento "ativo" mais relevante para cada obituário com base nas datas das cerimónias (`ceremony_events`). A prioridade é o evento futuro mais próximo. Se uma missa (7º dia, 30º dia, 1 ano) tem data dentro de 2 dias ou futura, essa tag prevalece. Caso contrário, mostra "Funeral" se existir funeral com campos preenchidos.

**Mapeamento de labels**:
- `funeral` → "Funeral"
- `cremacao` → "Cremação"  
- `missa7` → "Missa 7º Dia"
- `missa30` → "Missa 30º Dia"
- `missa1ano` → "Missa 1 Ano"
- `velorio` → "Velório"

**Alterações nos dados**:
- `PublicObituary` interface: adicionar campo opcional `active_tag: string | null`
- Queries em **Home.tsx**, **ObituaryArchive.tsx**: fazer join com `ceremony_events` para cada obituário e calcular a tag ativa client-side

**Alteração no `PublicObituaryCard.tsx`**:
- Adicionar Badge posicionado `absolute top-3 left-3` sobre a imagem com `bg-background/90 text-foreground` (como no screenshot)

### 2. Reordenação — Missas futuras reaparecem como recentes

Nas queries de listagem (Home, ObituaryArchive) com sort "recentes":
- Após carregar obituários por `death_date desc`, também carregar obituários que tenham `ceremony_events` com `event_date` nos próximos 2 dias (ou data futura próxima) para tipos missa7/missa30/missa1ano
- Estes são inseridos no topo da lista (ou mesclados por relevância) para que reapareçam como "recentes"
- Criar uma **database view ou função** que retorna obituários com a tag ativa baseada na cerimónia mais relevante, ou fazer esta lógica client-side

**Abordagem simplificada (client-side)**:
- Carregar separadamente obituários com missas futuras (próximos 2 dias) e uni-los ao topo da lista de recentes, removendo duplicados

### 3. Freguesia no card da funerária

**`FunerariaDetail.tsx`** (linha ~334-365):
- Adicionar `freguesia` à query de obituários: `select("id, display_name, birth_date, death_date, locality, freguesia, photo_url, service_type")`
- Atualizar interface local `PublicObituary` para incluir `freguesia`
- No card, mostrar `freguesia - locality` em vez de apenas `locality`

### 4. Logo 220px

**`PublicHeader.tsx`**: Alterar `w-[250px]` para `w-[220px]`

### 5. Função utilitária partilhada

Criar **`src/lib/ceremony-utils.ts`** com:
- `getActiveTag(events)`: recebe array de ceremony_events e retorna a tag ativa (string) ou null
- `getEventTagLabel(type)`: mapeamento de event_type para label formatada
- Reutilizada em PublicObituaryCard, Home, ObituaryArchive, FunerariaDetail

### Ficheiros editados

1. `src/lib/ceremony-utils.ts` — **novo**, funções utilitárias de tags
2. `src/components/obituaries/PublicObituaryCard.tsx` — Badge da tag sobre a imagem
3. `src/pages/Home.tsx` — carregar ceremony_events, calcular tags, reordenar por missas futuras
4. `src/pages/ObituaryArchive.tsx` — carregar ceremony_events, calcular tags, reordenar
5. `src/pages/FunerariaDetail.tsx` — adicionar freguesia à query e card, usar tags
6. `src/components/layout/PublicHeader.tsx` — logo 220px

