

## Plano: Botão "Condolências" faz scroll até à secção

### Estado atual
- **ObituaryDetail.tsx (linha 267)**: O botão "Condolências" no topo da página não tem `onClick` — não faz nada.
- **ObituaryDetail.tsx (~linha 330)**: A secção "Envie Mensagem de Condolências" existe mais abaixo mas não tem `id` nem `ref`.
- **PublicObituaryCard.tsx (linha 81)**: O botão nos cards públicos (Home/Arquivo) também só faz `stopPropagation()` — não navega nem faz scroll.
- A funcionalidade de envio de condolências ainda não está implementada (há um texto "em breve disponível").

### Alterações

#### 1. ObituaryDetail.tsx — Scroll suave no botão do topo
- Adicionar `id="condolencias"` ao `Card` da secção de condolências (~linha 329)
- No botão "Condolências" (linha 267), adicionar `onClick` que faz `document.getElementById('condolencias')?.scrollIntoView({ behavior: 'smooth' })`

#### 2. PublicObituaryCard.tsx — Navegar para detalhe com âncora
- No botão "Condolências" dos cards públicos, em vez de apenas `stopPropagation()`, navegar para `/obituario/{id}#condolencias`
- Usar `useNavigate` do React Router para fazer a navegação programática

#### 3. ObituaryDetail.tsx — Scroll automático ao abrir com hash
- No `useEffect` de carregamento, após os dados carregarem, verificar se `window.location.hash === '#condolencias'` e fazer scroll até à secção

