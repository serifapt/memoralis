

# Plano: Página Pública da Funerária — Configurações e Dados Reais

## Contexto

A página `/funerarias/:id` (`FunerariaDetail.tsx`) é 100% mock. O utilizador quer que as funerárias possam configurar todos os dados desta página nas Configurações do dashboard, com toggle de visibilidade e link personalizável.

## 1. Migration — Novos campos na tabela `funerarias`

Campos a adicionar (baseados no conteúdo da página exemplo):

```sql
ALTER TABLE public.funerarias
ADD COLUMN IF NOT EXISTS descricao text,              -- Texto "Sobre"
ADD COLUMN IF NOT EXISTS servicos text[] DEFAULT '{}', -- Lista de serviços
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS telefone_secundario text,
ADD COLUMN IF NOT EXISTS horario text,                 -- Horário de funcionamento
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS localidade text,              -- Cidade/Vila
ADD COLUMN IF NOT EXISTS codigo_postal text,
ADD COLUMN IF NOT EXISTS cover_image_url text,         -- Imagem de capa
ADD COLUMN IF NOT EXISTS slug text UNIQUE,             -- URL personalizado
ADD COLUMN IF NOT EXISTS pagina_publica_visivel boolean DEFAULT false;
```

RLS policy pública para SELECT (páginas visíveis):
```sql
CREATE POLICY "Public can view visible funerarias"
ON public.funerarias FOR SELECT
USING (pagina_publica_visivel = true);
```

## 2. Settings — Novo tab "Página Pública"

Adicionar um 6.º tab nas Configurações com todos os campos organizados em secções:

**Visibilidade e Link:**
- Switch: "Página pública visível"
- Input: Slug personalizado (ex: `funeraria-s-joao`) com preview do URL: `memoralis.lovable.app/funerarias/funeraria-s-joao`

**Sobre:**
- Textarea: Descrição/texto "Sobre"

**Imagem de Capa:**
- Upload de imagem (mesmo padrão do logo, bucket `funeraria-logos`)

**Contactos Adicionais:**
- Telefone secundário, Website
- Localidade, Código postal

**Redes Sociais:**
- Facebook URL, Instagram URL, LinkedIn URL

**Horário:**
- Textarea: Horário de funcionamento (texto livre)

**Serviços:**
- Input com chips/tags para adicionar/remover serviços (ex: "Funerais", "Cremação", etc.)

Todos os campos guardados num único `handleSavePublicPage` que faz `.update()` na tabela `funerarias`.

## 3. FunerariaDetail.tsx — Dados Reais

Refatorar para:
- Aceitar `id` como UUID ou slug
- Buscar da tabela `funerarias` onde `id = param` OR `slug = param` AND `pagina_publica_visivel = true`
- Mostrar dados reais: nome, descrição, serviços, contactos, horário, logo, cover image, redes sociais
- Buscar obituários públicos da funerária (`obituaries` onde `funeraria_id` e `is_public = true AND is_completed = true`)
- Secção de testemunhos: manter visual mas sem funcionalidade (não existe tabela)
- Mostrar mensagem 404 se funerária não encontrada ou não visível

## 4. Ficheiros alterados

- `supabase/migrations/` — nova migration
- `src/pages/Settings.tsx` — novo tab "Página Pública" com todos os campos
- `src/pages/FunerariaDetail.tsx` — refatorar para dados reais do Supabase

## Notas

- O bucket `funeraria-logos` já existe e é público — reutilizar para a cover image
- A RLS de SELECT pública precisa ser criada (atualmente só users autenticados veem a própria funerária)
- O slug deve ser validado para unicidade antes de guardar

