## Objetivo

Voltar a aplicar a janela de tempo definida por cada funerária no catálogo de flores. Manter o catálogo acessível como teste, mas com as regras de timing já a funcionar.

## O que muda no código

**`src/pages/ObituaryFlowers.tsx`** (linhas 116–120)

Remover o bypass DEV e reativar a verificação. Para a fase de teste, **não** bloquear pelo flag `servico_flores_ativo` (assim continua acessível para testar mesmo sem a funerária ter ativado), mas **bloquear** quando a janela de tempo (`isFlowerOrderOpen`) tiver expirado — redirecionando para o obituário.

```ts
if (!isFlowerOrderOpen(evRes.data || [], funRes.data?.flores_limite_horas ?? 4)) {
  navigate(`/obituario/${id}`, { replace: true });
  return;
}
```

Os outros pontos do site (`ObituaryArchive`, `PublicObituaryCard`, `ObituaryDetail`) já usam `isFlowerOrderOpen` corretamente para mostrar/esconder o botão "Enviar Flores" — não precisam de alterações.

## Fora deste plano (notas para depois)

Para passar de teste a produção real:

1. **Stripe Connect das funerárias** — cada funerária tem de completar o onboarding (`stripe_charges_enabled = true`). Já existe o ecrã em Settings (`FlowerStripeOnboarding`).
2. **Conta Stripe da Memoralis** — configurar a conta principal da plataforma (taxas de serviço / application fees já estão implementadas no `create-flower-checkout`).
3. **Moloni** — integrar para emissão automática de fatura/recibo após pagamento confirmado (novo edge function chamado a partir do `flower-stripe-webhook`). A planear num pedido próprio quando tivermos credenciais Moloni.
4. **Shopify** — deixa de ser necessário com Stripe + Moloni; não integrar.

Depois destes 3 passos, basta voltar a ativar também a verificação `servico_flores_ativo` (linha do bypass) para o fluxo ficar oficialmente em produção.
