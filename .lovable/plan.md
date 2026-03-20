

## Plano: Corrigir exibição de obituários no Dashboard, Home e Arquivo

### Problemas identificados

1. **Dashboard crashing** — O componente `Dashboard` está a dar erro de runtime (visível nos logs da consola). Provavelmente causado pelas alterações recentes (testemunhos/cerimónias). Preciso investigar a causa exacta do crash para corrigir.

2. **Home page usa dados mock** — `src/pages/Home.tsx` (linha 12) tem `const obituaries = Array(12).fill({...})` com dados falsos hardcoded. Não busca dados reais da base de dados.

3. **Arquivo público filtra por `is_completed = true`** — `src/pages/ObituaryArchive.tsx` (linha 80) só mostra obituários públicos E concluídos. Se o obituário ainda está "Em curso" (`is_completed = false`), não aparece no arquivo público, mesmo que esteja marcado como público.

### Alterações propostas

#### 1. Corrigir crash do Dashboard (`src/pages/Dashboard.tsx`)
- Investigar e corrigir o erro de runtime que impede o Dashboard de carregar
- Adicionar tratamento de erros defensivo nas queries

#### 2. Home page com dados reais (`src/pages/Home.tsx`)
- Remover o array mock `const obituaries = Array(12).fill({...})`
- Adicionar `useState` + `useEffect` para buscar os últimos obituários públicos do Supabase
- Query: `obituaries` onde `is_public = true`, ordenados por `death_date DESC`, limit 12
- **Não** filtrar por `is_completed` para que obituários em curso mas públicos também apareçam
- Renderizar os cards com dados reais (nome, datas, localidade, foto)

#### 3. Arquivo público — incluir obituários em curso (`src/pages/ObituaryArchive.tsx`)
- Remover o filtro `.eq("is_completed", true)` da query principal (linha 80) e da query de localidades (linha 57)
- Manter apenas o filtro `is_public = true`
- Assim, obituários públicos aparecem independentemente de estarem em curso ou concluídos

### Detalhes técnicos
- Home page: usar `supabase.from("obituaries").select("id, display_name, birth_date, death_date, locality, photo_url").eq("is_public", true).order("death_date", { ascending: false }).limit(12)`
- Cards na Home devem ter link para `/obituario/${id}`
- Manter o placeholder visual quando `photo_url` é null

