

## Adicionar visualizações e avaliações aos cards de funerárias + cards reais na Home

### Contexto
- Os cards de funerárias (arquivo e Home) não mostram visualizações nem avaliações
- A secção de funerárias na Home usa dados mock (`funeralHomes` array estático)
- A imagem de referência mostra: imagem, nome, estrela + rating + (count), localidade + eye icon + view count

### Dados necessários
- **Visualizações**: Não existe tabela `funeraria_views`. Serão agregadas a partir de `obituary_views` via join com `obituaries.funeraria_id`
- **Avaliações**: Tabela `funeraria_testimonials` com campo `rating` (1-5) e `status = 'approved'`

### Alterações

#### 1. Criar componente `PublicFunerariaCard`
Novo ficheiro `src/components/funerarias/PublicFunerariaCard.tsx`:
- Recebe dados da funerária + stats (avg rating, review count, view count)
- Layout igual ao arquivo: imagem (cover/logo/placeholder), nome, localidade
- Adiciona linha com: estrela + rating médio + (nº avaliações) à esquerda, eye icon + views à direita
- Rating só aparece se houver avaliações aprovadas

#### 2. Atualizar `src/pages/FunerariaArchive.tsx`
- Carregar stats de avaliações (`funeraria_testimonials` com `status = approved`, agrupado por `funeraria_id`)
- Carregar contagem de views (via `obituary_views` + `obituaries` agrupado por `funeraria_id`)
- Usar o novo componente `PublicFunerariaCard`

#### 3. Atualizar `src/pages/Home.tsx`
- Remover array mock `funeralHomes`
- Carregar funerárias reais (com `pagina_publica_visivel = true`, limit 6)
- Carregar stats (ratings + views) da mesma forma
- Usar o componente `PublicFunerariaCard`
- Adicionar loading state com Skeleton

### Estrutura do card (referência)
```text
┌──────────────────┐
│   [imagem 4:3]   │
├──────────────────┤
│ Nome Comercial   │
│ ★ 5.0 (146)      │
│ 📍 Localidade  👁 392│
└──────────────────┘
```

### Ficheiros editados/criados
1. **Criar** `src/components/funerarias/PublicFunerariaCard.tsx`
2. **Editar** `src/pages/FunerariaArchive.tsx` — usar novo componente + carregar stats
3. **Editar** `src/pages/Home.tsx` — substituir mock por dados reais + usar novo componente

