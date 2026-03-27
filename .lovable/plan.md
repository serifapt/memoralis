

## Simplificar "Acender Vela" e melhorar SEO

### Alterações

**`src/pages/ObituaryDetail.tsx`**:

1. **Remover o Dialog de vela** — eliminar estado `candleDialogOpen`, `candleName`, `submittingCandle` e o componente `<Dialog>` das velas (linhas 652-674)
2. **Simplificar `handleCandleSubmit`** — ao clicar no botão "Acender Vela", inserir diretamente na tabela `obituary_candles` sem `visitor_name` e incrementar o contador. Usar debounce local (desativar botão por 2s após clique) para evitar spam
3. **Botão direto** — o botão "Acender Vela" chama diretamente a função de insert, sem abrir dialog
4. **SEO / Indexação Google** — adicionar marcação JSON-LD (`schema.org/Person` com `deathDate`, `birthDate`, `name`, `image`) no `<head>` via `useEffect` + `document.head.appendChild`. Adicionar `<meta>` tags Open Graph dinâmicas para melhorar partilha e indexação. Usar elementos semânticos (`<article>`, `<section>`, heading hierarchy)

### Ficheiros editados

1. `src/pages/ObituaryDetail.tsx` — simplificar vela (sem dialog), adicionar JSON-LD e meta tags OG

