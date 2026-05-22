## Mudança de layout em `src/pages/ObituaryFlowers.tsx`

Atualmente o card do obituário ocupa a largura total do contentor (acima do grid catálogo+sidebar) e o aviso de serviço da funerária está dentro da sidebar (sticky com o carrinho).

### Novo comportamento

**Desktop (`lg+`)**
- O card do obituário sai do topo full-width e passa a ficar **dentro da coluna do catálogo**, ocupando apenas a largura dessa coluna.
- O card de aviso da funerária mantém-se na **coluna da direita (sidebar), na mesma linha** do card do obituário, por cima do "O seu pedido".
- Resultado visual: numa linha ficam lado a lado o card do falecido (esquerda, largura do catálogo) e o aviso (direita, largura da sidebar). Por baixo, o catálogo de produtos à esquerda e o carrinho à direita.

**Mobile / Tablet (`<lg`)**
- O grid colapsa para uma coluna.
- Ordem: card do obituário → card de aviso da funerária → catálogo → (carrinho fixo em baixo, como hoje).
- Ou seja, o aviso aparece logo abaixo do card do obituário, antes do catálogo.

### Implementação

Apenas em `src/pages/ObituaryFlowers.tsx`, dentro do bloco `step === "catalog"`:

1. Remover o `<Card>` full-width do resumo do obituário que está antes do grid.
2. Dentro da coluna esquerda do grid (`<div>` do catálogo), adicionar o card do obituário como primeiro elemento, antes do título "Catálogo de Flores".
3. Na sidebar (`<aside>`), o aviso da funerária já existe e fica como está — primeiro item, antes do carrinho. Assim ele alinha visualmente na mesma linha do card do obituário à esquerda.
4. Não mexer no step de checkout (mantém o card do obituário no topo full-width como hoje, já que esse passo não tem grid).

Sem alterações de dados, queries ou lógica — apenas reposicionamento de elementos.
