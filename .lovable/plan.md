## Plano: Adicionar 3 artigos SEO ao blogue

Inserir diretamente na tabela `blog_posts` (status `published`, `is_featured` apenas no primeiro) os 3 artigos propostos, com conteúdo Markdown completo, otimizado para SEO (H2/H3, palavras-chave naturais, listas, FAQ no fim), excerto, categoria, autor "Equipa Memoralis", read_time e imagem de capa.

### Artigos

1. **Como Escrever um Obituário: Guia Completo para Famílias e Funerárias**
   - Slug: `como-escrever-obituario-guia-completo`
   - Categoria: Guias
   - ~1500 palavras: estrutura, dados essenciais, modelo/template, tom, exemplos, digital vs jornal, FAQ
   - Destaque (`is_featured: true`)

2. **A Digitalização das Funerárias em Portugal: Tendências e Oportunidades para 2026**
   - Slug: `digitalizacao-funerarias-portugal-2026`
   - Categoria: Setor
   - ~1400 palavras: contexto, software de gestão, presença online, obituários digitais, reputação, casos de uso, próximos passos

3. **Obituário Digital vs. Jornal Impresso: O que Escolher em Portugal?**
   - Slug: `obituario-digital-vs-jornal-impresso-portugal`
   - Categoria: Comparativos
   - ~1200 palavras: tabela comparativa (custo, alcance, tempo, interatividade), vantagens de cada um, recomendação híbrida, FAQ

### Imagens de capa

Gerar 3 imagens (modelo `fast`, 1536x864, `.jpg`) em `src/assets/blog/`, com estética dark/serena alinhada com a marca (#D85151 / #2D595E), depois fazer upload para o bucket `blog-images` via `supabase--storage_upload` e usar o URL público em `cover_image_url`.

- `obituario-guia.jpg` — caderno aberto com caneta, vela acesa difusa, tons quentes serenos
- `digitalizacao-funerarias.jpg` — mesa com portátil e arranjo floral discreto, luz suave, tom profissional
- `obituario-digital-vs-jornal.jpg` — jornal impresso ao lado de smartphone com vela digital, contraste antigo/moderno

### Execução técnica

- 1 migration SQL com 3 `INSERT INTO blog_posts (...)` — `published_at = now()`, `status = 'published'`
- Não há alterações a ficheiros do frontend (a listagem e a página de artigo já consomem a tabela)
- Verificar em `/blog` após inserção

Sem alterações de schema nem de RLS.
