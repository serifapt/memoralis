# Integrar pedido de flores com Stripe

## Problema
Após o refactor do carrinho multi-produto, a página `/obituario/:id/flores` deixou de usar Stripe. O `onSubmit` faz `insert` direto em `flower_orders` + `flower_order_items` com status `PENDENTE` e mostra "Pedido Confirmado" sem cobrar nada. A edge function `create-flower-checkout` (que já cria sessão Stripe Connect com comissão Memoralis) está pronta mas nunca é chamada a partir da página.

O `SendFlowersModal` ainda usa Stripe corretamente, mas a página principal não.

## Objetivo
Restaurar o fluxo de pagamento Stripe na página, mantendo a UX multi-produto do carrinho.

## Alterações

### 1. `src/pages/ObituaryFlowers.tsx` — substituir `onSubmit`
- Remover insert direto em `flower_orders` / `flower_order_items`.
- Chamar `supabase.functions.invoke("create-flower-checkout", { body: { obituary_id, funeraria_id, items: cart.map(c => ({ product_id: c.product.id, quantity: c.quantity })), sender_name, sender_email, sender_phone, message, observations, billing } })`.
- Redirecionar `window.location.href = data.url` para o Stripe Checkout.
- Tornar `sender_email` obrigatório no schema (Stripe precisa para `customer_email`).
- Remover estado `orderComplete` (Stripe já redireciona para `success_url` = `/obituary/:id?flowers=success`). O ecrã "Pedido Confirmado" deixa de fazer sentido aqui.
- Trocar texto do botão para `"Pagar com Stripe"`.

### 2. Adicionar bloco "Quero fatura" (NIF + dados faturação)
Espelhar o que o `SendFlowersModal` já faz: checkbox `wantInvoice` que revela campos `billing_nif`, `billing_name`, `billing_address`, `billing_postal_code`, `billing_city`. Enviar como objeto `billing` no body só se marcado.

### 3. Estado de sucesso/cancelamento
A página `ObituaryDetail` (em `/obituary/:id`) deve mostrar um toast quando chega com `?flowers=success` ou `?flowers=cancelled`. Verificar se já existe — se não, adicionar `useEffect` que lê o query param e dispara `toast.success(...)` / `toast.info(...)`, depois limpa o URL.

### 4. Backend / Edge function
**Nenhuma alteração necessária.** `create-flower-checkout` já:
- aceita `items: [{product_id, quantity}]` (cart),
- valida funerária ativa + Stripe Connect ligado,
- calcula comissão `clamp(10%, 5€, 15€)`,
- cria `flower_orders` com `status: AGUARDA_PAGAMENTO`,
- cria sessão Stripe com `application_fee_amount` + `transfer_data` para a funerária.

O webhook `flower-stripe-webhook` já existe para confirmar pagamento e atualizar status.

## Detalhes técnicos
- Schema Zod: `sender_email: z.string().email("Email é obrigatório para pagamento")` (sem `.optional()`).
- Tratamento de erros: se `data.error` ou `error` da invoke, `toast.error(msg)` e re-habilitar botão.
- Loading state mantém-se (`isSubmitting`), label muda para `"A redirecionar para Stripe..."`.
- Manter validação `cart.length === 0` antes de submeter.

## Fora de scope
- Não alterar `SendFlowersModal` (já funciona).
- Não alterar edge functions nem webhook.
- Não alterar regras de comissão.
