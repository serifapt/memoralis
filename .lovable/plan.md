

## Plano: Adicionar filtros à página de Obituários

### Situação atual
A página `/obituaries` tem apenas pesquisa por nome. Não há forma de filtrar por estado do processo ou visibilidade.

Adicionalmente, a badge na linha 138 ainda usa `is_public && is_completed` para definir "Publicado", mas agora basta `is_public` para estar visível publicamente. Isto precisa de ser corrigido para mostrar badges mais úteis.

### Alterações

**Ficheiro: `src/pages/Obituaries.tsx`**

1. **Adicionar filtros por chip/botão** junto à barra de pesquisa:
   - **Estado do processo**: Todos | Em curso (`is_completed = false`) | Terminado (`is_completed = true`)
   - **Visibilidade**: Todos | Público (`is_public = true`) | Privado (`is_public = false`)

2. **Corrigir badges** nos cards:
   - Badge de visibilidade: "Público" (verde) ou "Privado" (cinza) — baseado apenas em `is_public`
   - Badge de processo: "Em curso" (amarelo/outline) ou "Terminado" (verde) — baseado em `is_completed`

3. **Mostrar contadores** nos filtros (ex: "Em curso (3)")

### Layout dos filtros
Os filtros aparecem dentro do Card de pesquisa existente, por baixo do input, como botões toggle inline (estilo chip), usando os componentes Button com variant outline/default.

### Detalhes técnicos
- Dois estados: `statusFilter: "all" | "active" | "completed"` e `visibilityFilter: "all" | "public" | "private"`
- Filtragem client-side sobre os dados já carregados (sem queries adicionais)
- Sem novas dependências

