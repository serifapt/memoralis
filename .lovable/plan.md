
# Plano: Pagamentos de Flores com Stripe Connect

## Contexto e regras de negócio

- Cliente final encomenda flores num obituário → funerária recebe pedido → trata com floristas e entrega no local do velório/funeral.
- `flores_limite_horas` (já existe) define janela mínima antes do funeral para aceitar encomendas.
- **Preços com IVA incluído**.
- **Fee Memoralis**: `max(10% do subtotal, 5€)`, **adicionado** ao total. Ex.: 80€ → fee 8€ → cliente paga 88€.
- **Reembolsos**: Memoralis retém **50% do fee** para cobrir custos Stripe; outros 50% devolvidos.
- **Faturação**: cada funerária emite fatura ao cliente final (Memoralis não fatura ao consumidor).
- Funerária recebe valor dos produtos diretamente na sua conta Stripe Connect.

## Arquitetura

```text
Cliente → Checkout Stripe → Pagamento 88€
                              ├─► 80€ → Conta Connect da Funerária
                              └─► 8€  → Conta Memoralis (application_fee)
```

## Fluxo de ativação no backoffice (dashboard funerária)

Aba **Settings → Flores** com card único progressivo:

1. **Estado inicial (serviço inativo)** — card explicativo com:
   - Como funciona o serviço (cliente encomenda, funerária entrega).
   - Regras de comissão: 10% min 5€ adicionado ao valor.
   - Política de reembolso (Memoralis retém 50% do fee).
   - **Aviso destacado**: "É obrigatório criar conta Stripe para receber pagamentos. A faturação ao cliente final é da responsabilidade da funerária."
   - Botão "Ativar serviço de flores" (toggle `servico_flores_ativo`).

2. **Após ativação, sem Stripe** — bloco automático:
   - "Configure a sua conta Stripe para começar a receber pedidos"
   - Botão "Configurar Stripe Connect" → cria conta Express + abre `account_link` em nova aba.
   - Enquanto não completo, **frontend público NÃO mostra opção de enviar flores** (mesmo com `servico_flores_ativo=true`).

3. **Onboarding em progresso** — "Continuar configuração no Stripe" + botão "Já completei" (chama refresh-status).

4. **Ativo** — badge "Pagamentos ativos" + link "Aceder ao dashboard Stripe" (login link Express) + botão para gerir catálogo.

## Fluxo de checkout (cliente final no `SendFlowersModal`)

Passos atuais (catálogo → detalhes → confirmação) mantidos, com mudanças no passo "detalhes":

**Secção "Os seus dados"**:
- Nome (obrigatório)
- Email (obrigatório — para recibo Stripe)
- Telefone

**Secção nova "Dados de faturação (opcional)"** — colapsada por defeito com toggle "Quero fatura":
- NIF
- Nome fiscal (se diferente)
- Morada
- Código postal
- Localidade
- País (default Portugal)

Estes dados são guardados em `flower_orders.billing_*` e passados ao Stripe via `customer_details` + `tax_id_data` para aparecerem no recibo. A **emissão da fatura formal é feita pela funerária** (não automática).

**Breakdown final**:
```
Subtotal:                    80,00 €
Taxa de serviço Memoralis:    8,00 €
─────────────────────────────────────
Total a pagar:               88,00 €
```

Botão "Pagar com Stripe" → redirect para Checkout → retorno em `/obituary/:id/flowers/success` ou `/cancelled`.

## Mudanças na base de dados

**`funerarias`** — adicionar:
- `stripe_account_id` (text)
- `stripe_onboarding_completed` (boolean, default false)
- `stripe_charges_enabled` (boolean, default false)

**`flower_orders`** — adicionar:
- `stripe_checkout_session_id` (text)
- `stripe_payment_intent_id` (text)
- `paid_at` (timestamptz)
- `refunded_at` (timestamptz)
- `refund_amount` (numeric)
- **Dados de faturação**:
  - `billing_nif` (text)
  - `billing_name` (text)
  - `billing_address` (text)
  - `billing_postal_code` (text)
  - `billing_city` (text)
  - `billing_country` (text, default 'PT')
- Novo estado: `AGUARDA_PAGAMENTO` (antes de `PENDENTE`), `REEMBOLSADO`.

**`flower_webhook_events`** (nova) — idempotência:
- `stripe_event_id` (text, unique), `type`, `payload_json`, `processed_at`.

**`platform_config`**:
- `flowers_commission_percent` = 10
- `flowers_commission_min` = 5
- `flowers_refund_fee_retention_percent` = 50

## Edge functions

1. **`create-flower-connect-account`** — cria conta Stripe Express + devolve `account_link` de onboarding.
2. **`refresh-flower-connect-status`** — verifica `charges_enabled` e atualiza BD.
3. **`stripe-connect-login-link`** — gera login link para o dashboard Express.
4. **`create-flower-checkout`** — valida `isFlowerOrderOpen`, calcula fee, cria Checkout Session com:
   - `payment_intent_data.application_fee_amount`
   - `transfer_data.destination = funeraria.stripe_account_id`
   - `customer_email`, `tax_id_collection` se NIF preenchido
   - Cria `flower_order` em `AGUARDA_PAGAMENTO`.
5. **`flower-stripe-webhook`** (`verify_jwt = false`) — `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`; idempotente.
6. **`refund-flower-order`** — só admin funerária; refund parcial do fee (retém 50% via `ApplicationFeeRefund`).

## Visibilidade pública

`SendFlowersModal` / botão "Enviar flores" só aparece se:
- `funeraria.servico_flores_ativo = true` **E**
- `funeraria.stripe_charges_enabled = true` **E**
- `isFlowerOrderOpen(events, flores_limite_horas) = true`

## Secrets necessários

- `STRIPE_SECRET_KEY` (já existe)
- **`STRIPE_FLOWERS_WEBHOOK_SECRET`** (novo — endpoint dedicado)

## Ordem de implementação

1. Migration BD (colunas funerarias, flower_orders, webhook events, platform_config)
2. Edge functions Connect (onboarding, refresh, login link)
3. UI Settings → Flores (card progressivo com regras + onboarding)
4. Gate de visibilidade pública (esconder "Enviar flores" sem Stripe ativo)
5. Edge functions checkout + webhook
6. SendFlowersModal: secção de faturação opcional + redirect Stripe
7. Páginas de retorno success/cancelled
8. Edge function refund + UI no FlowerOrders

## Pré-requisitos do utilizador

1. Ativar **Stripe Connect** no dashboard Stripe da Memoralis (Settings → Connect).
2. Criar webhook endpoint apontando para `https://oxvpukidtudltzntwlsz.supabase.co/functions/v1/flower-stripe-webhook` e fornecer o **signing secret** (vou pedir via add_secret quando começar).

Confirmas e avanço com implementação?
