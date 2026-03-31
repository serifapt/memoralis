

## Mostrar os 5 obituários mais recentes da mesma funerária

### Alteração

**`src/pages/ObituaryDetail.tsx`** — query de obituários relacionados

Manter o filtro `.eq("funeraria_id", obit.funeraria_id)` e garantir que a ordenação é `.order("created_at", { ascending: false })` com `.limit(5)`. Se a query já está assim, não há alteração necessária — apenas confirmar que o comportamento actual já cumpre o pedido.

