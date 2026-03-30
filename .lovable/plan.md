

## Plano: Ajustes nos cards de funerárias, cabeçalho, testemunhos e cards de obituários

### 1. Remover condolências e velas do card da funerária na Home

**Ficheiro:** `src/pages/Home.tsx` (linhas 343-354)

Remover o bloco que mostra `MessageSquare` e `Eye` (visualizações agregadas) no card da funerária. Manter apenas nome, rating e localidade.

### 2. Adicionar resumo de avaliações no cabeçalho da FunerariaDetail

**Ficheiro:** `src/pages/FunerariaDetail.tsx`

- Carregar stats da funerária (avg_rating, review_count) usando `fetchFunerariaStats`
- Colocar estrela + nota + contagem entre o nome e a morada no cabeçalho (ex: ★ 4.9 (48))
- Não adicionar badge "Destaque"

### 3. Mover testemunhos para cima dos obituários na FunerariaDetail

**Ficheiro:** `src/pages/FunerariaDetail.tsx` (linhas 347-396)

Inverter a ordem: colocar `<TestimonialsSection>` antes da secção de obituários.

### 4. Adicionar botão "Condolências" e "Enviar Flores" com modal no PublicObituaryCard

**Ficheiro:** `src/components/obituaries/PublicObituaryCard.tsx`

- Substituir o botão "Enviar Flores" por dois botões lado a lado:
  - **Condolências** (variant="outline", menor destaque) → navega para `/obituario/{id}#condolencias`
  - **Enviar Flores** (variant="default", destaque principal) → abre `SendFlowersModal` com o obituaryId/obituaryName/funerariaId pré-preenchidos
- Para isto, o `PublicObituary` interface precisa incluir `funeraria_id`
- Importar e usar `SendFlowersModal` dentro do card, controlado por estado local

### 5. Garantir funeraria_id disponível nos dados do PublicObituaryCard

**Ficheiros:** `src/pages/Home.tsx`, `src/pages/ObituaryArchive.tsx`, `src/pages/FunerariaDetail.tsx`

Garantir que o `funeraria_id` é incluído na query e passado ao card para o modal de flores funcionar.

### Ficheiros a alterar
- `src/pages/Home.tsx`
- `src/pages/FunerariaDetail.tsx`
- `src/components/obituaries/PublicObituaryCard.tsx`
- `src/pages/ObituaryArchive.tsx` (se aplicável)

