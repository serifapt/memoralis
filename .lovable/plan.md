# Preparação para lançamento público

Plano dividido em 4 frentes. Podem ser implementadas por ordem ou em paralelo — sugiro começar pela Home + Blog porque desbloqueiam comunicação.

## 1. Página inicial (Home)

Substituir secções com placeholders/lorem ipsum por conteúdo real:

- **"Adicione uma memória especial"** — reescrever os 4 passos (Criar conta → Adicionar dados do ente querido → Personalizar homenagem → Partilhar com família) com cópia real e CTA correto (apontar para `/funeraria/register` ou fluxo de obituário consoante público-alvo).
- **Secção "Destaques"** — passar a mostrar funerária(s) reais marcadas como destaque (novo campo `destaque` em `funerarias` ou usar a mais recente/melhor avaliada). Remover placeholder "Funerária S. João".
- **Secção "Artigos"** — ligar aos artigos reais do blogue (últimos 3 publicados) em vez do array hardcoded.
- Pequena secção nova **"Serviços"** com cards para: Obituários, Cuidado de Memoriais (Care), Flores, Diretório de Funerárias, Diretório de Floristas (Brevemente), Missas por Paróquia (Brevemente).

## 2. Blogue editável no admin

Hoje o `/blog` e `/blog/:slug` usam dados hardcoded. Tornar dinâmico:

- Nova tabela `blog_posts` (título, slug, excerpt, conteúdo rich text/markdown, categoria, autor, imagem de capa, tempo de leitura, estado draft/published, publicado_em).
- Página `/blog` e `/blog/:slug` passam a ler do Supabase (apenas publicados).
- Novo separador no painel admin: **`/admin/blog`** com lista + criar/editar/eliminar/publicar. Editor de conteúdo simples (textarea markdown ou rich text leve). Upload de imagem de capa para um bucket público novo `blog-images`.
- Featured article = post mais recente publicado marcado como `is_featured`.

## 3. Página Sobre com 3 tabs

Reorganizar `/sobre` com `Tabs` (shadcn):

- **Público / Famílias** — quem somos, missão, como ajudamos famílias, obituários, condolências, partilha de memórias.
- **Profissional / Funerárias** — proposta de valor para funerárias (gestão de obituários, orçamentos, comunicações, diretório, CTA para `/funeraria/register`).
- **Serviços** — apenas o Care por agora (resumo + CTA para `/care`). Espaço preparado para Flores, Diretório de Floristas e Missas quando estiverem prontos.

Manter o hero atual partilhado por cima das tabs. Conteúdo existente da página é redistribuído pelas tabs em vez de eliminado.

## 4. Novos diretórios públicos (brevemente)

Duas páginas novas, ambas em modo "Brevemente" para já, mas com rota real para podermos linkar:

- **`/floristas`** — diretório de floristas a nível nacional. Layout placeholder (hero + "Em breve" + formulário "Sou florista, quero ser notificada quando lançar" que grava num leads simples).
- **`/missas`** — informações de missas por paróquia a nível nacional. Mesmo padrão "Em breve" com captura de email para notificação.

Adicionar links nestes destinos no menu público (`PublicHeader`) e na nova secção Serviços da Home/Sobre, com badge "Brevemente".

## Detalhes técnicos

- **DB novas tabelas**:
  - `blog_posts` com RLS: leitura pública apenas para `status = 'published'`; CRUD restrito a admin (`has_role(auth.uid(), 'admin')`).
  - `coming_soon_leads` (page enum: `floristas`|`missas`, email, created_at) — insert público, leitura só admin.
  - Bucket público novo `blog-images` com policy de upload restrita a admin.
- **Admin**: novo item na `AdminSidebar` ("Blog") apontando para `/admin/blog`. Página de lista + dialog/route `/admin/blog/new` e `/admin/blog/:id`.
- **Routing**: adicionar rotas `/floristas`, `/missas`, `/admin/blog`, `/admin/blog/:id` em `App.tsx`.
- **Home**: refactor das secções placeholder, ligar a `blog_posts` para os 3 últimos artigos.
- **Sobre**: usar `Tabs` shadcn já existente; sem alterações de dados.
- Tudo respeita design tokens existentes (Inter/Archivo, brand #D85151 / #2D595E).

## Fora de scope (sugiro para depois)

- Conteúdo real e completo do diretório de floristas e missas por paróquia (precisa de fonte de dados / parcerias).
- Editor rich-text avançado (TipTap/Lexical) — começamos com markdown simples e evoluímos se necessário.
- SEO técnico avançado por post (sitemap dinâmico, JSON-LD Article) — fácil de adicionar numa segunda iteração.