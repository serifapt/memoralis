# Plano: separar site público (`memoralis.pt`) e app (`app.memoralis.pt`)

## Objetivo

Manter **um único projeto** Lovable, mas servi-lo em dois domínios com papéis claros:

- `memoralis.pt` → site público: home, obituários, funerárias, blog, sobre, contactos, login, registo, página de unsubscribe.
- `app.memoralis.pt` → área autenticada: dashboard funerária, admin, técnicos, settings, gestão de obituários, orçamentos, flores, contactos internos.

Esta abordagem traz a separação de marca/URL e SEO mais limpo, sem o custo de duplicar o projeto. Quando o produto crescer mais, podemos partir em dois projetos Lovable separados sem perder este trabalho.

## O que muda para o utilizador

- Quem visita `memoralis.pt/dashboard` é redirecionado para `app.memoralis.pt/dashboard` (e equivalentes para `/admin/*`, `/settings`, `/obituaries`, `/ceremonies`, `/clients`, `/contacts`, `/testimonials`, `/documents`, `/flowers/*`, `/budgets/*`, `/support`, `/field/tasks`, `/care/*` autenticado, `/account/*`, `/technician/auth`).
- Quem visita `app.memoralis.pt/` ou rotas públicas (`/obituario`, `/funerarias`, `/blog`, `/sobre`, `/contactos`) é redirecionado para `memoralis.pt/...`.
- `/login`, `/forgot-password`, `/reset-password`, `/unsubscribe`, `/funeraria/register` ficam disponíveis em **ambos** os domínios (entry points partilhados).
- Sessão Supabase mantém-se ao saltar entre domínios (cookie no domínio raiz `.memoralis.pt`).

## Passos técnicos

### 1. Configurar domínios em Lovable
- Adicionar `app.memoralis.pt` como custom domain do mesmo projeto (Project Settings → Domains).
- Manter `memoralis.pt` e `www.memoralis.pt` como já estão.

### 2. Componente `DomainRouter`
Novo wrapper em `src/components/routing/DomainRouter.tsx` que corre no topo do `<Routes>`:
- Lê `window.location.hostname`.
- Define dois conjuntos de rotas: `PUBLIC_ROUTES` (prefixos: `/`, `/obituario`, `/funerarias`, `/blog`, `/sobre`, `/contactos`, `/care` público) e `APP_ROUTES` (prefixos: `/dashboard`, `/admin`, `/obituaries`, `/ceremonies`, `/clients`, `/contacts`, `/testimonials`, `/documents`, `/flowers`, `/budgets`, `/support`, `/settings`, `/field`, `/account`, `/funeraria/status`, `/technician`).
- Rotas partilhadas (`/login`, `/forgot-password`, `/reset-password`, `/unsubscribe`, `/funeraria/register`, `/care/auth`, `/care/checkout`) não são redirecionadas.
- Se `hostname === 'memoralis.pt'` e o path está em `APP_ROUTES` → `window.location.replace('https://app.memoralis.pt' + pathname + search + hash)`.
- Se `hostname === 'app.memoralis.pt'` e o path está em `PUBLIC_ROUTES` → redirect para `memoralis.pt`.
- Em `localhost` / preview Lovable, não faz nada (modo dev).

### 3. Login flow (`src/pages/Auth.tsx`)
- Após autenticação bem-sucedida, em vez de `navigate('/dashboard')`, fazer `window.location.assign('https://app.memoralis.pt/dashboard')` (e equivalentes para admin/técnico) quando estamos em `memoralis.pt` em produção. Em dev/preview continua a usar `navigate()`.
- Helper `getAppOrigin()` em `src/lib/domains.ts` centraliza esta lógica.

### 4. URLs absolutos em emails e edge functions
Atualizar todos os links absolutos para usar o domínio certo:
- **Auth (Supabase)**: redirect URLs em `resetPasswordForEmail` → `https://memoralis.pt/reset-password`. Atualizar Site URL / Redirect URLs nas Auth settings para incluir ambos os domínios.
- **Emails transacionais** (`supabase/functions/_shared/transactional-email-templates/*`): links "Ver pedido", "Ver obituário" apontam para `memoralis.pt` (obituários públicos) ou `app.memoralis.pt` (gestão).
- **Edge functions de notificação** (`notify-funeraria-activation`, `notify-funeraria-correction`, `invite-funeraria-member`, etc.): qualquer URL absoluto passa a usar `app.memoralis.pt` para áreas autenticadas.
- **Open Graph / SEO** em obituários: `og:url` continua em `memoralis.pt/obituario/:id` (correto, é público).
- **Stripe redirect URLs** (`create-flower-checkout`, `create-care-checkout`): success/cancel URLs apontam para o domínio adequado.

### 5. Auth Supabase — Site URL & Redirect URLs
- Site URL principal: `https://memoralis.pt`.
- Redirect URLs adicionais: `https://memoralis.pt/*`, `https://app.memoralis.pt/*`, `https://*.lovable.app/*` (para previews).

### 6. SEO
- `robots.txt` em `app.memoralis.pt` → `Disallow: /` (impedir indexação da área privada).
- `robots.txt` em `memoralis.pt` mantém-se.
- Como servimos o mesmo build, isto fica num middleware/componente: o `<head>` injeta `<meta name="robots" content="noindex">` quando `hostname === 'app.memoralis.pt'`.

## Riscos e mitigações

- **Cookies Supabase**: por defeito a sessão é guardada em `localStorage`, não em cookies, portanto a sessão **não atravessa** subdomínios automaticamente. O utilizador faz login em `memoralis.pt/login` e é redirecionado para `app.memoralis.pt` — onde precisa de fazer login outra vez. **Mitigação**: o redirect pós-login passa o `access_token` + `refresh_token` no hash da URL (como o Supabase já faz para magic links) e `app.memoralis.pt` chama `supabase.auth.setSession()` ao carregar. Ou (mais simples) o `/login` passa a existir só em `app.memoralis.pt` e `memoralis.pt/login` redireciona.
- **Decisão recomendada**: opção mais simples — `/login`, `/forgot-password`, `/reset-password` movem-se exclusivamente para `app.memoralis.pt`. O botão "Entrar" no header público leva diretamente para `https://app.memoralis.pt/login`.
- **Links antigos**: bookmarks em `memoralis.pt/dashboard` continuam a funcionar via redirect 302 client-side.
- **Preview Lovable**: o `DomainRouter` deteta `*.lovable.app` e desativa redirects, evitando partir o preview.

## Estimativa de esforço

Pequeno-médio: ~1 dia de trabalho focado, distribuído em:
1. Configurar `app.memoralis.pt` em Lovable (DNS) — 15 min do utilizador.
2. `DomainRouter` + helper `domains.ts` + ajustes ao `Auth.tsx` — 1-2 h.
3. Atualizar URLs em edge functions e templates de email — 2-3 h.
4. Configurar Auth Supabase Site URL / Redirect URLs — 10 min.
5. `noindex` para `app.memoralis.pt` — 15 min.
6. QA: testar login, reset password, redirects, emails, Stripe checkout — 1-2 h.

## Fora deste plano (futuro)

- Separar mesmo em dois projetos Lovable (quando o bundle do site público começar a custar SEO/LCP).
- Pacote partilhado de componentes UI.
- Edge cache diferenciado por domínio.
