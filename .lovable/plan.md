
# Plano: Notificações de email para pedidos de flores

## 1. Atualização rápida da página `/contactos`

- Telefone: `+351 928 282 582`
- Morada: `Incubo, 4970-786 Arcos de Valdevez`
- Horário: `Seg a Sex: 10h-18h`

## 2. Domínio de envio: `memoralis.pt`

Atualmente está verificado `notify.serifa.pt` (não vai ser usado). Vou abrir o diálogo de Email Setup para registar **memoralis.pt** → subdomínio `notify.memoralis.pt` delegado aos nameservers da plataforma.

`From: Memoralis <flores@notify.memoralis.pt>`

> Enquanto o DNS propaga, todo o resto fica configurado e os emails começam a sair assim que ficar verificado.

## 3. Campo configurável de email na funerária

### BD
Adicionar à tabela `funerarias`:
- `email_notificacoes_flores` (text, nullable, validado por formato)

### UI (Settings → Flores → card de ativação do catálogo)
- Input opcional **"Email para receber notificações de pedidos"**
- Helper text: *"Se deixar vazio, as notificações vão para o email do administrador da conta."*
- Guardado em edição direta (sem toggle).

### Resolução do destinatário (no webhook)
1. `funerarias.email_notificacoes_flores` se preenchido
2. Email do admin mais antigo em `funeraria_members` (via service role → `auth.users.email`)
3. Caso falhe, log de warning (não bloqueia o pedido)

## 4. Quando os emails são disparados

Apenas em `checkout.session.completed` dentro de `flower-stripe-webhook`, após pagamento confirmado. Idempotência garantida pela tabela `flower_webhook_events` já existente.

## 5. Templates (React Email, branding Memoralis)

### a) Cliente — `flower-order-customer-confirmation`
- **Para:** email do remetente
- **Assunto:** "Pedido de flores confirmado — {nomeFalecido}"
- **Reply-To:** email da funerária
- Conteúdo: saudação, confirmação de pagamento, resumo (itens + subtotal + taxa serviço + total), mensagem do remetente, aviso que a funerária trata da entrega, nota sobre fatura (emitida pela funerária com NIF se fornecido).

### b) Funerária — `flower-order-funeraria-notification`
- **Para:** email resolvido conforme regras acima
- **Assunto:** "Novo pedido de flores — {nomeFalecido}"
- **Reply-To:** email do cliente
- Conteúdo:
  - Cabeçalho "Novo pedido pago"
  - Falecido + link para obituário
  - Local/data do velório/funeral
  - Lista de produtos
  - **Valor que vai receber** (subtotal — taxa Memoralis já descontada pelo Stripe Connect)
  - Dados do cliente (nome, email, telefone)
  - Mensagem de condolências (para o cartão)
  - Observações
  - Dados de faturação (NIF + morada fiscal) com aviso "Cliente solicitou fatura"
  - Botão "Ver pedido no Memoralis"

Branding: cores `#D85151` / `#2D595E`, fontes do projeto, body bg branco.

## 6. Implementação técnica

1. Diálogo Email Setup para `memoralis.pt`.
2. Migration: `funerarias.email_notificacoes_flores`.
3. `setup_email_infra` (queue pgmq + cron + tabelas de log/supressão).
4. `scaffold_transactional_email` (edge functions sender/unsubscribe/supressão + página de unsubscribe no app).
5. Criar os 2 templates em `_shared/transactional-email-templates/` + atualizar `registry.ts`.
6. Atualizar `FlowerStripeOnboarding.tsx` com o input de email + save.
7. Atualizar `flower-stripe-webhook`:
   - Carregar pedido completo (items, funeraria, obituário, ceremony_events)
   - Resolver email funerária (campo → admin fallback)
   - Invocar `send-transactional-email` 2× em paralelo com idempotency keys `flower-order-{id}-customer` / `…-funeraria`
8. Redeploy: `send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression`, `process-email-queue`, `flower-stripe-webhook`.

Aprovas para avançar?
