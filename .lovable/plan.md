## Objetivo

Aumentar o destaque visual dos tabs e transformar o tab "Agências Funerárias" numa secção tipo landing-page SaaS (estilo da imagem de referência ERPSAA), com mockup de portátil a mostrar o dashboard e grelha de 7 funcionalidades-chave para convencer funerárias a registar-se.

## Alterações em `src/pages/Sobre.tsx`

### 1. Tabs com mais destaque visual

- Adicionar ícone à esquerda do label em cada `TabsTrigger`:
  - **Público** — `Users`
  - **Agências Funerárias** — `Building2`
  - **Serviços** — `Sparkles`
- Aumentar altura/padding dos triggers, ícone 18px ao lado do texto.
- Estado ativo: fundo `bg-primary text-primary-foreground` (segue regra core de hover/selection) com sombra subtil.
- Título de cada tab (`h2`) passa a vermelho (`text-primary`) em vez de `foreground`, para criar o "título vermelho" pedido.
- O badge superior ("Para as Famílias" / "Para Funerárias" / "Serviços Memoralis") mantém-se acima do título.

### 2. Tab "Agências Funerárias" — reconstrução completa

Estrutura inspirada na referência:

**A. Hero interno**
- Badge vermelho "Para Funerárias"
- H2 vermelho: *"A plataforma que profissionaliza o seu serviço"*
- Subtítulo curto
- 2 CTAs: "Registar Funerária" (primary) + "Ver demo" (outline, scroll para mockup)
- **Mockup de portátil** centrado por baixo, com screenshot do dashboard real da funerária. Sombra dramática + glow vermelho subtil por trás.

**B. Grelha "Tudo num só sítio" (7 funcionalidades)**
- Pequeno título "Tudo num só sítio"
- Grid responsivo 3 colunas (desktop) / 2 (tablet) / 1 (mobile), 7 cards:
  1. **Gestão do processo fúnebre** — `ClipboardList`
  2. **Formulários SS e CGA automáticos** — `FileCheck2`
  3. **Anúncio fúnebre automático** — `Newspaper`
  4. **Arquivo de documentação** — `FolderArchive`
  5. **Orçamentação digital** — `Calculator`
  6. **Catálogo de flores para o público** — `Flower2`
  7. **Eventos e estatísticas** — `BarChart3`
- Cada card: ícone vermelho num quadrado com fundo `bg-primary/10`, título a bold, descrição de 1–2 linhas.

**C. Três secções alternadas (zigzag)** com mockup à esquerda/direita e texto ao lado, destacando as 3 funcionalidades mais fortes:
1. **Gestão do processo fúnebre** — mockup do editor de obituário (lista de campos, progresso).
2. **Formulários SS/CGA automáticos** — mockup da geração de PDFs (lista de formulários gerados).
3. **Catálogo de flores + Orçamentação** — mockup do catálogo público + orçamento.

Cada zigzag tem: mini-badge, h3 vermelho, parágrafo descritivo, 2–3 bullets com `CheckCircle2` vermelho.

**D. Banda escura com stats** (estilo referência)
- Fundo `bg-[hsl(var(--footer-bg))]` (dark green da marca) com glow vermelho.
- 3 métricas com números grandes:
  - **9 formulários** SS/CGA preenchidos automaticamente
  - **Horas poupadas** por processo
  - **100% digital** — sem papel

**E. CTA final**
- "Pronto para profissionalizar a sua funerária?" + botão "Registar Funerária".

### 3. Mockups (imagens)

Gerar 4 imagens de mockup de portátil via `imagegen--generate_image` (premium quality para legibilidade do UI), guardadas em `src/assets/`:
- `mockup-dashboard.png` — hero principal
- `mockup-obituary-editor.png` — zigzag 1
- `mockup-ss-forms.png` — zigzag 2
- `mockup-flowers-budget.png` — zigzag 3

Prompts vão pedir: portátil MacBook moderno, ângulo ligeiramente frontal, ecrã a mostrar UI de gestão funerária em português, paleta consistente com a marca (vermelho #D85151 + verde #2D595E + neutros claros), fundo transparente.

Alternativa simpler: usar uma moldura SVG de portátil em CSS e meter screenshots reais do dashboard por dentro. **Vou começar pelas imagens geradas** porque dão acabamento mais polido (como na referência) e evitam captura manual de várias rotas autenticadas.

## Detalhes técnicos

- Novos ícones lucide-react a importar: `ClipboardList`, `FileCheck2`, `Newspaper`, `FolderArchive`, `Calculator`, `BarChart3`.
- Manter todas as cores via tokens semânticos (`text-primary`, `bg-primary/10`, `border-primary/50`).
- Sem alterações de lógica/dados — puramente apresentação.
- Mantém os outros tabs ("Público" e "Serviços") intactos, exceto pelo título a vermelho + ícone no trigger.
- Responsivo: laptop mockup escala em mobile (max-w-full), zigzag colapsa para coluna única.

## Fora do âmbito

- Não mexe nas restantes secções da página (Values, Platform Features, etc.).
- Não toca em rotas, backend, nem lógica do dashboard.
