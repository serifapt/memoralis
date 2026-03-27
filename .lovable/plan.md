

## Plano: Contadores de visualizações, condolências e velas acesas

### Resumo
Adicionar contadores visuais (visualizações, condolências, velas) aos cards de obituário e à página pública de detalhe. Implementar a funcionalidade de "acender vela" na página pública do obituário.

### 1. Base de dados — Novas tabelas

**Tabela `obituary_views`**: Regista cada visualização de um obituário.
```sql
CREATE TABLE public.obituary_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  viewer_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.obituary_views ENABLE ROW LEVEL SECURITY;
-- Qualquer pessoa pode inserir (registar visualização)
CREATE POLICY "Anyone can insert views" ON public.obituary_views FOR INSERT WITH CHECK (true);
-- Leitura pública para contagem
CREATE POLICY "Anyone can read views" ON public.obituary_views FOR SELECT USING (true);
```

**Tabela `obituary_candles`**: Regista cada vela acesa.
```sql
CREATE TABLE public.obituary_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  visitor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.obituary_candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can light candles" ON public.obituary_candles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read candles" ON public.obituary_candles FOR SELECT USING (true);
```

### 2. Contadores nos cards de obituário

**`PublicObituaryCard.tsx`**:
- Expandir a interface `PublicObituary` com campos opcionais: `view_count`, `condolence_count`, `candle_count`
- Adicionar uma linha de contadores compactos abaixo da localização, antes do botão "Enviar Flores":
  - `Eye` icon + view_count
  - `MessageSquare` icon + condolence_count
  - `Flame` icon + candle_count

**Queries que alimentam os cards** (Home.tsx, ObituaryArchive.tsx, FunerariaDetail.tsx):
- Após carregar os obituários, fazer queries agregadas para obter contagens por obituary_id (views, condolences aprovadas, candles) e injectar nos dados antes de passar ao card.

### 3. Página pública do obituário (`ObituaryDetail.tsx`)

**Secção do topo (header card)**:
- Adicionar linha de contadores (Eye + views, MessageSquare + condolências, Flame + velas) entre a localização e os botões de partilha
- Registar automaticamente uma visualização no `useEffect` ao carregar a página (com debounce por sessionStorage para evitar duplicados)

**Funcionalidade "Acender Vela"**:
- Adicionar botão "Acender Vela" (com ícone Flame) junto aos botões "Condolências" e "Enviar Flores"
- Ao clicar, abre um pequeno diálogo ou inline form com campo opcional "O seu nome"
- Ao confirmar, insere na tabela `obituary_candles` e actualiza o contador em tempo real
- Animação subtil do ícone de chama ao acender

### 4. Ficheiros editados

1. **Migration SQL** — criar tabelas `obituary_views` e `obituary_candles` com RLS
2. **`src/components/obituaries/PublicObituaryCard.tsx`** — adicionar contadores visuais
3. **`src/pages/ObituaryDetail.tsx`** — contadores no topo, registar view, funcionalidade de vela
4. **`src/pages/Home.tsx`** — carregar contagens e passá-las ao card
5. **`src/pages/ObituaryArchive.tsx`** — carregar contagens e passá-las ao card
6. **`src/pages/FunerariaDetail.tsx`** — carregar contagens para os cards de obituário inline

