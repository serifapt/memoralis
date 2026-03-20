

## Plano: Mostrar funerária nos cards de obituário com link para página pública

### Problema
Os cards de obituário (Home e ObituaryArchive) não mostram a funerária associada.

### Alterações

#### 1. Home (`src/pages/Home.tsx`)
- Expandir a query para incluir a funerária: `.select("id, display_name, birth_date, death_date, locality, photo_url, funeraria_id, funerarias(nome_comercial, slug)")`
- Atualizar a interface `PublicObituary` para incluir `funeraria_id` e `funerarias: { nome_comercial: string; slug: string | null } | null`
- Adicionar abaixo da localidade uma linha com ícone `Home` (ou `Building`) e o nome da funerária, envolvido num `Link` para `/funerarias/{slug}` (com `e.stopPropagation()` para não navegar para o obituário)

#### 2. ObituaryArchive (`src/pages/ObituaryArchive.tsx`)
- Expandir a query (linha 77) para incluir `funerarias(nome_comercial, slug)` via join
- Atualizar a interface `PublicObituary` para incluir `funerarias`
- Adicionar a mesma linha de funerária nos cards, antes dos botões

#### Resultado
Cada card de obituário mostra o nome da funerária com link clicável para a sua página pública (`/funerarias/{slug}`).

