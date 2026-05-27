# Adesão Care: página única + cemitério ligado à BD

## Objetivo
Substituir o atual wizard de 4 passos (`/care/aderir`, `src/pages/CareSignup.tsx`) por uma página de subscrição corrida, onde todas as secções aparecem na mesma vista. Ao selecionar o cemitério (a partir dos cemitérios ativos da BD), os campos relacionados são preenchidos automaticamente e mostrados ao cliente.

## Alterações

### 1. `src/pages/CareSignup.tsx` — layout corrido
- Remover o estado `step`, a `Progress`, e os botões "Anterior/Continuar".
- Manter o mesmo `Card` central, mas dentro renderizar 4 secções empilhadas, cada uma com título e separador subtil:
  1. **Os seus dados** (nome, email, telefone, NIF)
  2. **A campa** (cemitério + detalhes)
  3. **O plano** (cards de planos, periodicidade, datas comemorativas, mensagem)
  4. **Confirmar e enviar** (resumo + botão "Enviar pedido")
- Um único botão CTA no fim ("Enviar pedido"), com validação inline (mostrar mensagens de erro por secção em vez de bloquear navegação). Reaproveitar a função `submit()` existente e o resumo do passo 4 atual.
- Manter o `searchParams.get("plano")` para pré-selecionar plano.
- Scroll suave para a primeira secção inválida ao tentar submeter.

### 2. Auto-preenchimento ao escolher cemitério
- Estender `useCemeteriesCascade` / `CemeteryRow` para já trazer `freguesia`, `morada`, `lat`, `lng` (já estão na query — só falta usá-los).
- Em `handleCemeteryChange`, além de preencher `cemetery_name` e `cemetery_address`, guardar também `lat`/`lng` no estado `grave` (adicionar campos `lat` e `lng`).
- Abaixo do `Select` do cemitério, mostrar um cartão informativo com:
  - Morada completa
  - Município · Freguesia
  - Mini-mapa de leitura (reaproveitar `CemeteryPicker` em modo só-leitura, ou um `<a>` para Google Maps com `lat,lng`) quando existirem coordenadas
- Estes dados são meramente informativos para o cliente confirmar que é o cemitério correto. Não passam novos campos para o backend além dos já existentes (`cemetery_id` é a fonte de verdade no servidor).

### 3. Sem alterações de BD nem de Edge Functions
- A tabela `cemeteries` e a função `care-signup` ficam iguais. A página continua a invocar `care-signup` com o mesmo payload.

## Notas técnicas
- Reutilizar componentes já existentes: `Card`, `Input`, `Select`, `Popover`, `CareInterestDialog`, `CemeteryPicker`.
- Tokens semânticos do design system (`bg-primary/5`, `border-border`, `text-muted-foreground`) — sem cores hardcoded.
- Validação: derivar um objeto `errors` a partir do estado atual e mostrar `<p className="text-destructive text-sm">` por campo, sem bloquear a interação com as outras secções.
