## Objetivo
1. Substituir o seletor único de cemitério por filtros em cascata (Localidade → Freguesia → Cemitério) no formulário de adesão e no diálogo "Avise-me".
2. Criar gestão de cemitérios ativos no admin com possibilidade de colocar pin no mapa.
3. Corrigir os bugs visíveis nas imagens.

## Bugs identificados
- **Mapa Leaflet por cima do diálogo** (imagem 3): tiles e marcadores do `CemeteryMap` da landing aparecem sobre o `CareInterestDialog`. Causa: `.leaflet-pane`/`.leaflet-top` têm `z-index: 400/1000`, maiores que o overlay do Dialog (z-50 do Radix). Solução: regra global em `index.css` baixando z-index do Leaflet (`.leaflet-pane, .leaflet-top, .leaflet-bottom { z-index: 1 !important; }`) — mantém interatividade do mapa mas deixa de sobrepor modais.
- **"Outro / não está na lista"** (imagem 1): será removido — sempre que a localidade existir o cliente seleciona em cascata; só se nenhum cemitério estiver ativo na sua zona usa o diálogo de interesse.

## Mudanças de base de dados
- Adicionar coluna `freguesia text` à tabela `public.cemeteries` (migration). `municipio` passa a ser a "Localidade".
- Adicionar coluna `freguesia text` à tabela `public.care_interest_leads` (já existe `locality` e `parish`).

## Filtros em cascata (frontend)
Hook partilhado `useCemeteriesCascade()` em `src/hooks/useCemeteriesCascade.ts`:
- carrega cemitérios `ativo=true`
- expõe `localities`, `parishesFor(loc)`, `cemeteriesFor(loc, parish)`

Aplicado a:
- **`CareSignup.tsx` (passo 2)**: três selects encadeados. Remove input livre "Nome do cemitério"; mantém `section`, `grave_number`, fotos.
- **`CareInterestDialog.tsx`**: mesmos três selects. Localidade e cemitério permitem opção "Não encontro a minha"; nesse caso aparecem inputs de texto livres (`locality`, `parish`, `cemetery_name`) — esta é a única via para manuscrever cemitério.

## Admin — Gestão de cemitérios
Nova página `src/pages/AdminCemeteries.tsx` (rota `/admin/care/cemeterios`):
- Tabela: Nome, Freguesia, Localidade (município), Ativo, Ações (editar / desativar).
- Dialog "Adicionar / Editar cemitério" com: nome, freguesia, localidade, morada, switch `ativo`, e um pequeno `LeafletPicker` (mapa centrado em Portugal, clique coloca pin → preenche `lat`/`lng`; mostra coords editáveis).
- Componente `src/components/care/CemeteryPicker.tsx` (Leaflet com `useMapEvents` para captar clique).

Entrada no `AdminSidebar` em "CUIDADO & HOMENAGEM": **Cemitérios** (ícone `MapPin`), rota `/admin/care/cemeterios`. Registar rota em `App.tsx`.

## Edge function
`care-signup` aceita já `cemetery_id`; nenhuma alteração necessária para o fluxo principal. Apenas garantir que `cemetery_name` é derivado de "{nome} — {freguesia}, {municipio}" para histórico.

## Ficheiros a criar/editar
- **Migration**: adiciona `freguesia` em `cemeteries` e `care_interest_leads`.
- **Criar**: `src/hooks/useCemeteriesCascade.ts`, `src/pages/AdminCemeteries.tsx`, `src/components/care/CemeteryPicker.tsx`.
- **Editar**: `src/pages/CareSignup.tsx` (passo 2 reescrito com cascade), `src/components/care/CareInterestDialog.tsx` (cascade + fallback manual), `src/components/layout/AdminSidebar.tsx` (nova entrada), `src/App.tsx` (rota), `src/index.css` (fix z-index Leaflet).

## Fora de âmbito
- Importação em massa de cemitérios (continuam a ser adicionados manualmente pelo admin).
- Geocodificação automática de morada → coordenadas.
