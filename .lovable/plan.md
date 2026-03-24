

## Plano: Implementar condolências com gravação na BD e gestão na edição do óbito

### 1. Criar tabela `condolences` (migração)

```sql
CREATE TABLE public.condolences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id uuid NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  message text NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.condolences ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar
CREATE POLICY "Anyone can insert condolences"
  ON public.condolences FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Público pode ver condolências aprovadas de obituários públicos
CREATE POLICY "Public can view approved condolences"
  ON public.condolences FOR SELECT
  TO anon, authenticated
  USING (is_approved = true AND EXISTS (
    SELECT 1 FROM obituaries o WHERE o.id = condolences.obituary_id AND o.is_public = true
  ));

-- Funerárias podem ver/gerir condolências dos seus óbitos
CREATE POLICY "Funerarias can manage own condolences"
  ON public.condolences FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM obituaries o JOIN funerarias f ON f.id = o.funeraria_id
    WHERE o.id = condolences.obituary_id AND f.user_id = auth.uid()
  ));
```

### 2. ObituaryDetail.tsx — Formulário funcional

- Adicionar states para `authorName`, `authorEmail`, `condolenceMessage`, `submitting`
- No `onSubmit`, inserir na tabela `condolences` via Supabase client
- Mostrar toast de sucesso/erro
- Remover o texto "em breve disponível"
- Após envio, mostrar as condolências aprovadas abaixo do formulário (query pública)

### 3. NewObituary.tsx — Novo tab "Condolências"

- Adicionar `TabsTrigger value="condolencias"` ao lado de "Anúncios"
- No `TabsContent`, listar condolências do obituário com nome, email, data, mensagem
- Opção de aprovar/rejeitar (toggle `is_approved`)
- Opção de eliminar
- Botão "Exportar Excel" que gera e descarrega um `.xlsx` com todas as colunas (nome, email, mensagem, data, estado) usando uma biblioteca client-side simples (gerar CSV ou usar `xlsx`/`SheetJS`)

### 4. Exportação Excel

- Usar a biblioteca `xlsx` (SheetJS) para gerar o ficheiro no browser
- Colunas: Nome, Email, Mensagem, Data, Estado
- Nome do ficheiro: `condolencias_{display_name}.xlsx`

### Detalhes técnicos
- Ficheiros alterados: `src/pages/ObituaryDetail.tsx`, `src/pages/NewObituary.tsx`
- Nova migração SQL para a tabela `condolences`
- Instalar dependência `xlsx` para exportação Excel
- Sem alterações a ficheiros auto-gerados

