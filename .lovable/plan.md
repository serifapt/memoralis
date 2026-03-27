

## Atualizar filtros dos arquivos de Obituários e Funerárias

### Contexto
Os filtros atuais são simples (nome + localidade + ordenação). Os screenshots mostram filtros mais completos com dropdowns em linha e botões de tag para tipo de cerimónia.

### Alterações necessárias

#### 1. Migração de base de dados
Adicionar coluna `distrito` a ambas as tabelas:
- `obituaries` -- `distrito text`
- `funerarias` -- `distrito text`

#### 2. Arquivo de Obituários (`ObituaryArchive.tsx`)
**Filtros em linha (5 colunas no desktop):**
- Nome (input com ícone Search)
- Localidade (Select dropdown com ícone MapPin)
- Freguesia (Select dropdown com ícone MapPin)
- Distrito (Select dropdown com ícone MapPin)
- Funerária (Select dropdown com ícone Home)

**Botões de tag (pill buttons abaixo dos filtros):**
- Todos | Funeral | Missa 7º dia | Missa 30º dia | Missa Anual
- Ao selecionar uma tag, filtrar obituários cujo `active_tag` corresponda

**Contador + ordenação (à direita dos pills):**
- "X resultados" + dropdown "Most popular" / "Mais recentes" / "Nome A-Z"

**Dados adicionais a carregar:**
- Freguesias únicas dos obituários públicos
- Distritos únicos
- Funerárias (nome_comercial + id) dos obituários públicos via join

**Lógica de filtragem:**
- Freguesia e Distrito filtram via query Supabase (`.eq()`)
- Funerária filtra por `funeraria_id`
- Tag filtra client-side pelo campo `active_tag` já calculado

#### 3. Arquivo de Funerárias (`FunerariaArchive.tsx`)
**Filtros em linha (4 colunas no desktop):**
- Nome (input com ícone Search)
- Localidade (Select dropdown)
- Distrito (Select dropdown)
- Avaliação (Select dropdown -- placeholder, sem dados reais por agora, apenas UI)

**Dados a carregar:**
- Localidades únicas e distritos únicos das funerárias com página pública visível

#### 4. Layout visual dos filtros
- Grid responsivo: `grid-cols-1 md:grid-cols-5` (obituários) e `md:grid-cols-4` (funerárias)
- Selects com ícones à esquerda (MapPin para localização, Home/Building para funerária, Star para avaliação)
- Pills de tag como `Button variant="outline"` com `rounded-full`, estado ativo com `variant="default"`

### Ficheiros editados
1. **Migração SQL** -- adicionar `distrito` a `obituaries` e `funerarias`
2. **`src/pages/ObituaryArchive.tsx`** -- novos filtros (freguesia, distrito, funerária, tag pills), layout atualizado
3. **`src/pages/FunerariaArchive.tsx`** -- novos filtros (localidade dropdown, distrito, avaliação), carregar dados únicos

