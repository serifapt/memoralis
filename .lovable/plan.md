## Continuação da implementação Memoralis Care

Já está feito: migração de BD, `care-status.ts`, `CareSiteHeader`, `CemeteryMap`, redesign de `/care` (landing).

Falta implementar nas próximas fases:

### Fase 1 — Fluxo de adesão (`/care/aderir`)
- `src/pages/CareSignup.tsx` — wizard de 4 passos:
  1. Dados pessoais (nome, email, telefone, NIF opcional)
  2. Dados da campa (cemitério via dropdown de `cemeteries`, número, secção, fotos opcionais para `care-media`)
  3. Plano + periodicidade (Mensal/Quinzenal/Semanal/Premium) e datas comemorativas (aniversário, dia de finados, etc.)
  4. Resumo + confirmação
- Componentes: `CareSignupWizard.tsx`, `StepPersonal.tsx`, `StepGrave.tsx`, `StepPlan.tsx`, `StepReview.tsx`
- Edge Function `care-signup`: cria `customers`, `memorial_locations`, `care_subscriptions` (status `pending_payment`). Se `STRIPE_SECRET_KEY` existir → chama `create-care-checkout`; caso contrário fica em `pending_payment` e envia emails.
- Rota em `App.tsx` e proteção via `CareAuth` quando necessário.

### Fase 2 — Dashboard do cliente (`/account/care` redesign)
Reescrever `CustomerDashboard.tsx`:
- Cabeçalho com saudação simples ("Olá, [Nome]") e botão grande "Pedir Ajuda"
- Uma card por campa, com 3 separadores:
  - **Informação**: dados da campa, plano, próxima visita, notas editáveis (`memorial_locations.notes`)
  - **Histórico de Visitas**: lista cronológica de `service_tasks` concluídas com fotos antes/depois e estrelas (`visit_reviews`)
  - **Faturas**: "Em breve" se `MOLONI_CLIENT_ID` vazio, senão tabela de faturas
- Tipografia 16–17px, espaçamento generoso, sem jargão técnico.

### Fase 3 — Painel admin (`/admin/care/*`)
- `AdminCareSubscriptions.tsx` (já existe) — adicionar ações: **Ativar** (status `pending_payment` → `active`), **Pausar**, **Cancelar**
- `AdminCareTasks.tsx` (já existe) — adicionar form de registo de visita: upload fotos antes/depois (`care-media`), checklist, notas → atualiza `service_tasks` para `completed`
- Nova página `AdminCemeteries.tsx` — CRUD de cemitérios (lat/lng com pino no `CemeteryMap`)
- Adicionar entradas ao `AdminSidebar`.

### Fase 4 — Emails transacionais
4 templates em `supabase/functions/_shared/transactional-email-templates/`:
1. `care-signup-customer.tsx` — confirmação de pedido ao cliente
2. `care-signup-admin.tsx` — alerta a `geral@memoralis.pt`
3. `care-activated-customer.tsx` — quando admin ativa a subscrição
4. `care-visit-completed.tsx` — relatório de visita (com fotos antes/depois)
Registar em `registry.ts` e disparar via `send-transactional-email`.

### Fase 5 — Integrações condicionais
- **Stripe**: já existe `create-care-checkout` e `care-stripe-webhook`. Confirmar que o webhook atualiza `status='active'` e `activated_at`. Detetar ausência de `STRIPE_SECRET_KEY` no signup edge function.
- **Moloni**: criar edge function stub `moloni-invoices` que devolve `[]` se `MOLONI_CLIENT_ID` ausente; senão lista faturas via API. Adicionar `MOLONI_CLIENT_ID` e `MOLONI_CLIENT_SECRET` aos secrets (perguntar ao user antes).

### Ordem de execução proposta
1. Fase 1 (signup wizard + edge function) — bloco maior
2. Fase 4 (emails, ficam prontos para serem chamados pelo signup)
3. Fase 2 (dashboard cliente)
4. Fase 3 (admin)
5. Fase 5 (Moloni stub)

### Pergunta antes de avançar
Queres que avance já com **Fase 1 + Fase 4 juntas** (wizard de adesão + emails), ou preferes ver primeiro só o wizard funcional (sem emails) e validar o UX antes de passar ao resto?
