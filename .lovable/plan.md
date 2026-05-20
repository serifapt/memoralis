# Carrinho multi-produto de flores — UX mobile-first

Permitir adicionar vários produtos (com quantidades distintas) ao mesmo pedido, mantendo um fluxo fluido em mobile (390px) e desktop.

## UX Mobile (default)

1. **Catálogo em grelha 2 colunas** (como hoje). Cada card passa a ter um botão "Adicionar" em vez de abrir painel lateral.
2. **Tocar no card → bottom sheet com o detalhe do produto**: imagem, descrição completa, categoria, preço, seletor de quantidade e botão "Adicionar ao pedido". Fecha o sheet ao adicionar.
3. **Botão flutuante (FAB) "Ver pedido"** fixo no fundo, visível assim que o carrinho tem ≥1 item. Mostra contador de itens e total.
4. **Tocar no FAB → bottom sheet do carrinho**:
   - Lista de itens com mini-thumb, nome, preço unitário, controles +/− para quantidade e botão remover.
   - "Editar" reabre o sheet de detalhe do produto.
   - Resumo: subtotal, taxa de serviço (10%, min €5, max €15), total.
   - Botão primário "Continuar para os seus dados".
5. **Ecrã de checkout** (mesma route, troca de step): formulário (nome, email, telefone, mensagem, observações) + resumo colapsado do carrinho no topo. Botão "Confirmar Pedido".

## UX Desktop (lg+)

- Grelha 3 colunas à esquerda, **carrinho persistente** na sidebar direita.
- Clicar num card abre um Dialog com detalhe + "Adicionar".
- Sidebar mostra itens, totais, e (quando não vazio) o formulário inline com "Confirmar Pedido".

## Estado local

```ts
type CartItem = { product: FlowerProduct; quantity: number };
const [cart, setCart] = useState<CartItem[]>([]);
const [detailProduct, setDetailProduct] = useState<FlowerProduct | null>(null);
const [cartOpen, setCartOpen] = useState(false);
const [step, setStep] = useState<"catalog" | "checkout">("catalog");
```

Helpers: `addToCart`, `updateQty`, `removeFromCart`, `cartCount`, `subtotal`.

## Cálculo de totais

- `subtotal = Σ(item.product.price * item.quantity)`
- Taxa de serviço aplica-se **ao pedido inteiro**: `clamp(subtotal * 10%, €5, €15)` — comportamento atual mantido.
- Edge function `create-flower-checkout` **já aceita** `items: [{product_id, quantity}, ...]` → sem alterações backend.

## Persistência

`onSubmit` passa a iterar `cart` e inserir N linhas em `flower_order_items` via `.insert([...])` único. `subtotal`/`total` calculados a partir do carrinho.

## Componentes a criar

- `src/components/flowers/CartSheet.tsx` — bottom sheet (mobile) / sticky card (desktop) com lista, controles de qty, totais e CTA.
- `src/components/flowers/ProductDetailSheet.tsx` — Sheet (mobile) / Dialog (desktop) com detalhe + qty selector. Reutilizado para "Adicionar" e "Editar".
- `src/components/flowers/CartFab.tsx` — FAB `fixed bottom-4 inset-x-4 z-40`, só mobile, esconde quando o sheet abre.

## A alterar

- `src/pages/ObituaryFlowers.tsx` — refactor para o novo state e steps `catalog | checkout`.
- `src/components/flowers/FlowerProductCard.tsx` — callback `onAdd` em vez de selecionar; badge "✓ No pedido • Qtd: N" quando já no carrinho.

## Detalhes técnicos

- Catálogo vazio mantém empty state atual; checkout sem itens volta a `catalog`.
- `pb-24` no catálogo mobile para o FAB não tapar a última linha.
- Foco devolvido ao card de origem quando o sheet fecha; `aria-label` no FAB com contagem.
- Bloquear "Continuar" se carrinho vazio; "Confirmar" se form inválido.

## Fora do scope

- Persistir carrinho em localStorage.
- Alterar `create-flower-checkout` (já suporta multi-item).
