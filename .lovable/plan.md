## Objetivo

Refinar a aba "Agências Funerárias" da página `/sobre` com três ajustes:
1. Remover os CTAs do hero interno (manter apenas o CTA final).
2. Uniformizar os `TabsTrigger` ao estilo do resto do site, com ícone **acima** do texto (sem bold extra).
3. Substituir os mockups de portátil por **screenshots reais** do dashboard, apresentados em molduras de janela de browser (estilo ERPSAA da referência).

## Alterações em `src/pages/Sobre.tsx`

### 1. Tabs uniformes com ícone acima

- Cada `TabsTrigger` passa a ter layout vertical: ícone (20px) no topo + label por baixo.
- Tipografia: `font-medium` (não bold), mesmo tamanho do resto do site.
- Padding mais generoso (`py-3 px-4`, `h-auto`).
- Estado ativo continua com `bg-primary text-primary-foreground` (regra core do projeto).
- Sem cores especiais nem sombras extra — mantém-se consistente com outros tabs do site (ex.: settings).

### 2. Remover CTAs do hero interno da aba "Agências Funerárias"

- Remover os botões "Registar Funerária" e "Ver demo" do hero.
- Manter o badge + h2 vermelho + subtítulo.
- O CTA final ("Pronto para profissionalizar a sua funerária?") **mantém-se** no fundo.

### 3. Substituir mockups de portátil por screenshots reais em "browser frame"

**Captura dos screenshots reais** (via browser automation, login com `funeraria.teste@memoralis.pt`):
- `/dashboard` → `screen-dashboard.png`
- Editor de obituário (`/obituaries/:id`) → `screen-obituary-editor.png`
- Documentos / formulários SS gerados → `screen-ss-forms.png`
- Catálogo de flores + orçamentos → `screen-flowers-budget.png`

Viewport de captura: 1440×900, formato PNG, guardados em `src/assets/`.

**Componente `BrowserFrame`** (novo, inline em Sobre.tsx ou pequeno componente):
- Moldura simples tipo janela: barra superior com 3 círculos (red/yellow/green muted), barra de URL falsa esbatida, e a imagem dentro.
- Fundo `bg-card`, border `border-border`, `rounded-xl`, `shadow-2xl`, leve glow vermelho atrás (`bg-primary/20 blur-3xl`).
- Replace dos 4 `<img src={mockup...}>` actuais por `<BrowserFrame src={screen...} alt="..."/>`.

Aplica-se a:
- Hero da aba (screen do dashboard, grande)
- 3 secções zigzag (editor obituário, formulários SS, flores/orçamentos)

### 4. Limpeza

- Apagar as 4 imagens antigas: `mockup-dashboard.png`, `mockup-obituary-editor.png`, `mockup-ss-forms.png`, `mockup-flowers-budget.png`.
- Remover os respectivos imports não usados.

## Fora do âmbito

- Grelha de 7 funcionalidades, secção zigzag (estrutura), banda dark de stats e CTA final mantêm-se tal como estão (apenas as imagens mudam).
- Tabs "Público" e "Serviços" continuam intactos (apenas herdam o novo estilo de `TabsTrigger`).
- Sem alterações de lógica/dados.

## Detalhes técnicos

- Captura: `browser--navigate_to_sandbox` com viewport 1440×900, login via formulário, navegação a cada rota, `browser--screenshot` (não full_page para hero/zigzag — viewport limpo). Imagens descarregadas e gravadas em `src/assets/` via `code--copy` ou comando equivalente.
- `BrowserFrame`: componente pequeno tipado com `src`, `alt`, opcional `className`. Usa tokens semânticos (`bg-muted`, `border-border`, `bg-card`).
- Risco: se algum screen real estiver com pouco conteúdo de demo, ajusto temporariamente os dados de teste antes de capturar (sem persistir lixo). Se não for viável, faço fallback para o mockup gerado dessa secção específica.
