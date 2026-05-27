# Plano — Memoralis Care (redesign completo)

## 1. Base de dados (migrations)

Reaproveitar tabelas existentes (`customers`, `care_plans`, `care_plan_prices`, `memorial_locations`, `care_subscriptions`, `service_tasks`, `technicians`) e adicionar/ajustar:

- **`cemeteries`** (nova): `id`, `nome`, `municipio`, `morada`, `lat`, `lng`, `ativo`, timestamps. RLS: leitura pública; escrita só admin.
- **`memorial_locations`**: adicionar `cemetery_id` (FK → cemeteries), `section`, `grave_number`, `names_on_grave`, `birth_date`, `death_date`, `notes`.
- **`care_subscriptions`**: adicionar `status` com valores `pending_payment | pending_activation | active | suspended | canceled`; adicionar `commemorative_dates jsonb` (até 3 entradas para Premium); `activated_at`, `activated_by`.
- **`service_visits`** (nova, distinta de `service_tasks` que é agenda interna): `id`, `subscription_id`, `visit_date`, `before_photo_url`, `after_photo_url`, `services jsonb` (lista de tags), `internal_notes`, `created_by`. RLS: cliente vê as suas; admin tudo.
- **`visit_reviews`** (nova): `id`, `visit_id` (unique), `rating 1-5`, `comment`, `created_at`. Cliente só insere uma vez para a sua visita.
- Seed dos 4 planos (Mensal 50€, Quinzenal 90€, Semanal 160€ "popular", Premium 200€) em `care_plans` + `care_plan_prices` (sem `stripe_price_id`).
- Seed inicial dos 4 cemitérios de Lisboa.
- Storage bucket `care-media` já existe — reutilizar para before/after.

## 2. Página pública `/care` (`CareLanding.tsx` reescrita)

Header próprio com âncoras: Início | Como funciona | Planos | Cemitérios | FAQ | Contacto. Botão "Aderir ao serviço" (vermelho); se autenticado → "A minha conta".

Secções na mesma página (scroll suave):
- **Hero** — copy especificado, dois CTAs âncora, sem login.
- **Como funciona** — 4 cards numerados.
- **Planos** — 4 cards lado a lado (Semanal com badge "Mais popular"), nota de rodapé sobre cancelamento.
- **Cemitérios** — mapa Leaflet (`react-leaflet` + OpenStreetMap, sem necessidade de API key) + lista pesquisável; clique foca pin. CTA "Não encontra o seu cemitério?".
- **FAQ** — accordion com as 7 perguntas.
- **Contacto** — bloco com email/telefone (mesmos da página `/contactos`).

Tipografia base 16–17px, botões generosos, espaçamento amplo. Copy substitui "subscrição" por "serviço".

## 3. Wizard de adesão `/care/aderir` (novo)

Componente único `CareSignupWizard` com 4 passos, barra de progresso, navegação Anterior/Seguinte, validação por passo (zod).

- **Passo 1** — Dados pessoais (nome, email, telemóvel). Se autenticado, pré-preenchido e ocultável.
- **Passo 2** — Campa (dropdown cemitérios ativos, secção, nº, nome na lápide, datas, notas).
- **Passo 3** — Datas comemorativas (só Premium; 3 seletores com tipo + data condicional).
- **Passo 4** — Resumo + checkbox Termos + "Confirmar Adesão".

**Submissão:** edge function `care-signup` que cria/atualiza `customers`, cria `memorial_locations`, cria `care_subscriptions` com `status='pending_payment'` (sempre, até Stripe ativo), grava `commemorative_dates`. Invoca emails (cliente + admin). Devolve subscription_id.

**Lógica Stripe:** edge function detecta se `STRIPE_SECRET_KEY` está definida; se sim, devolve URL de Checkout (usando `STRIPE_PRICE_*` por plano) e front redireciona; se não, vai direto à página de confirmação "Pedido recebido 🙏".

## 4. Emails (transactional)

Templates React Email em `_shared/transactional-email-templates/`:
- `care-signup-customer` — confirmação ao cliente.
- `care-signup-admin` — alerta ao admin (`ADMIN_EMAIL`, default `geral@memoralis.pt`).
- `care-activated-customer` — após admin ativar.
- `care-visit-completed` — após registo de visita (com fotos e serviços).

Triggers: edge function `care-signup` dispara os 2 primeiros; ação "Ativar" no admin dispara o terceiro; registo de visita dispara o quarto. Tudo via `send-transactional-email` com `idempotencyKey`.

(Pré-requisito: scaffolding de email infra + domínio. Se ainda não estiver configurado, mostro botão de setup antes.)

## 5. Dashboard do cliente `/minha-conta` (substitui/renova `CustomerDashboard`)

Rota com `ProtectedRoute`. Header simples com logo e "Sair".

- Lista de cards por campa: nome, cemitério, plano, badge de estado, "Ver detalhes".
- Botão "Adicionar nova campa" → wizard começa no Passo 2.
- Detalhe `/minha-conta/campa/:id` com 3 tabs:
  - **Informações** — campos read-only + edição de notas/telefone.
  - **Histórico de visitas** — lista cronológica com galeria antes/depois, badges de serviços, form de avaliação 1–5★ + comentário (uma vez).
  - **Faturas** — se `MOLONI_CLIENT_ID` vazio → "A faturação automática estará disponível em breve."; caso contrário lista com download PDF.

## 6. Painel admin (estender `/admin`)

Novas páginas dentro do `AdminLayout`:
- `/admin/care` — dashboard com contadores + lista destacada de pendentes + atalhos.
- `/admin/care/subscriptions` — tabela com filtros (estado, plano, cemitério, data); ações Ativar / Suspender / Cancelar / Editar; ao Ativar muda status e dispara email.
- `/admin/care/subscriptions/:id/visita` — formulário registar visita (data/hora, upload 2 fotos para `care-media`, checkboxes de serviços, notas internas). Cria `service_visits` e dispara email ao cliente.
- `/admin/care/cemiterios` — CRUD com toggle ativo/inativo, lat/lng.
- `/admin/care/clientes` — lista + detalhe com campas e histórico.

Edge functions admin: `care-activate-subscription`, `care-register-visit` (faz upload metadata + invoca email).

## 7. Variáveis de ambiente e integrações

Pedir ao utilizador para adicionar (via secrets) — todas opcionais/vazias inicialmente: `STRIPE_SECRET_KEY` (já existe), `STRIPE_PRICE_MENSAL`, `STRIPE_PRICE_QUINZENAL`, `STRIPE_PRICE_SEMANAL`, `STRIPE_PRICE_PREMIUM`, `STRIPE_WEBHOOK_SECRET`, `MOLONI_CLIENT_ID`, `MOLONI_CLIENT_SECRET`, `ADMIN_EMAIL`.

Edge functions verificam `Deno.env.get(...)`; ramo "inativo" usado quando vazio. Webhook `care-stripe-webhook` já existe — adaptar para novo `status` e disparar `care-activated-customer` quando aplicável (mas só funciona quando keys estiverem definidas).

Moloni: stub de edge function `moloni-issue-invoice` que retorna noop se sem credenciais; quando ativo, chamada após pagamento bem-sucedido no webhook Stripe.

## 8. Detalhes técnicos

- Mapa: `react-leaflet` + `leaflet` (instalar). Tiles OSM, sem chave.
- Validação: `zod` (já no projeto).
- Upload fotos: `supabase.storage.from('care-media').upload(...)` com path `visits/{subscription_id}/{visit_id}/{before|after}.jpg`.
- Estados de subscrição centralizados em `src/lib/care-status.ts` com labels PT e cores de badge.
- Tokens de design: usar `--primary` (#D85151) para CTAs, manter consistência com restante site; aumentar tamanhos de fonte/padding nas páginas públicas/cliente via classes utilitárias dedicadas (`text-care-base` etc. ou simplesmente `text-base md:text-lg`).
- SEO: meta tags na landing (title, description, OG), JSON-LD `Service`.

## Ordem de implementação

1. Migrations (tabelas + seeds).
2. `CareLanding` redesenhada + mapa + FAQ.
3. Wizard `CareSignupWizard` + edge function `care-signup`.
4. Email infra (se faltar) + 4 templates.
5. Dashboard cliente + tabs.
6. Painel admin Care + registar visita.
7. Stripe/Moloni: ramos condicionais + webhook.

Confirmas para avançar?
