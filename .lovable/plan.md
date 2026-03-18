

# Plano: Corrigir página de Obituários para usar dados reais da base de dados

## Problema
A página `src/pages/Obituaries.tsx` usa **dados mock hardcoded** com IDs numéricos (1, 2) em vez de buscar obituários reais da base de dados. Quando se clica em "Editar", navega para `/obituaries/1/edit` e o componente `NewObituary` tenta fazer query com `"1"` como UUID, causando o erro `invalid input syntax for type uuid: "1"`.

## Solução
Reescrever `src/pages/Obituaries.tsx` para:

1. **Buscar obituários reais** da tabela `obituaries` via Supabase, filtrados pela `funeraria_id` do utilizador autenticado (mesmo padrão usado em `useClients.ts`)
2. **Mostrar dados reais** (display_name, birth_date, death_date, locality, etc.) com estados de loading e empty
3. **Buscar ceremony_events** associados para mostrar data/hora/local da cerimónia
4. **Links corretos** usando os UUIDs reais dos obituários
5. **Pesquisa funcional** filtrando por nome (`display_name`)
6. **Badge de estado** para mostrar se o obituário está publicado (`is_public` + `is_completed`) ou em rascunho

### Estrutura do componente:
- `useState` para obituários, loading, e search query
- `useEffect` para fetch inicial: buscar `funeraria_id` do user → buscar obituários dessa funerária
- Filtro de pesquisa local por `display_name`
- Manter o mesmo layout de cards mas com dados dinâmicos

### Dados mostrados por card:
- `display_name` (nome)
- `birth_date` - `death_date` (datas formatadas)
- `locality` ou `freguesia` (localização)
- Badge: "Publicado" / "Rascunho"
- Botões: Ver (público), Editar (com UUID real), PDF

Nenhuma alteração à base de dados é necessária — as RLS policies já permitem que funerárias vejam os seus próprios obituários.

