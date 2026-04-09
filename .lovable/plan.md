

## Limite de pedidos de flores antes do funeral

### Resumo
Adicionar uma configuração por funerária que define até quantas horas antes do funeral o serviço de flores está disponível. O botão "Enviar Flores" fica invisível quando falta menos do que o limite definido ou quando o funeral já passou.

### Alterações na base de dados

**Migration**: Adicionar coluna `flores_limite_horas` à tabela `funerarias`:
```sql
ALTER TABLE public.funerarias
ADD COLUMN flores_limite_horas integer NOT NULL DEFAULT 4;
```
Esta coluna define o número de horas antes do funeral após as quais os pedidos de flores deixam de ser aceites (default: 4 horas).

### Lógica de visibilidade

Criar uma função utilitária `isFlowerOrderOpen(events, limiteHoras)` que:
1. Encontra o evento `funeral` ou `cremacao` nos ceremony_events
2. Combina `event_date` + `event_time` (ou 00:00 se sem hora) para obter o datetime do funeral
3. Calcula `deadline = funeralDatetime - limiteHoras`
4. Retorna `true` se `now < deadline`, `false` caso contrário (incluindo se não houver evento funeral)

### Ficheiros a alterar

1. **`src/lib/ceremony-utils.ts`** — Adicionar função `isFlowerOrderOpen(events, limiteHoras)`

2. **`src/pages/ObituaryDetail.tsx`** — Buscar `flores_limite_horas` e `servico_flores_ativo` da funerária; condicionar o botão "Enviar Flores" com `isFlowerOrderOpen`

3. **`src/components/obituaries/PublicObituaryCard.tsx`** — Receber `flores_limite_horas` e `servico_flores_ativo` como props (ou via join na query pai); condicionar o botão "Enviar Flores"

4. **`src/pages/ObituaryArchive.tsx`** / **`src/pages/Index.tsx`** (ou onde o `PublicObituaryCard` é usado) — Passar os dados da funerária (incluindo `flores_limite_horas` e `servico_flores_ativo`) junto com os dados do obituário, ou adicionar ao join existente

5. **`src/pages/FlowerCatalog.tsx`** — Adicionar campo de configuração "Limite de horas antes do funeral" nas definições do serviço de flores, gravando em `funerarias.flores_limite_horas`

6. **`src/pages/NewObituary.tsx`** — Condicionar o botão "Enviar Flores" no card de pré-visualização (pode manter sempre visível no editor, ou aplicar a mesma lógica)

### Detalhes técnicos

- A query pública dos obituários (archive, homepage) já faz join com `funerarias` — basta adicionar `servico_flores_ativo` e `flores_limite_horas` ao select
- Cada card de obituário precisa de acesso aos `ceremony_events` desse obituário para calcular a deadline; nos contextos onde já existem (ObituaryDetail), usam-se os existentes; nos cards do archive/homepage, é necessário passar os eventos ou fazer o cálculo server-side
- Para simplificar nos cards públicos (archive), a abordagem mais eficiente é: se `servico_flores_ativo = false` → esconder; se o obituário tem evento funeral com data passada → esconder; caso contrário, calcular com base no limite de horas

