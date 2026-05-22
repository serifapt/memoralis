## Objetivo

Aproveitar melhor o espaço no desktop da página `/obituario/:id/flores`, reduzindo o card grande do falecido (atualmente em full-width acima do catálogo) e colocando uma versão compacta dentro da coluna direita, por cima do "O seu pedido".

## Comportamento

**Mobile / Tablet (`<lg`)**
- Mantém o card atual em full-width no topo (como está hoje). É importante em mobile porque o carrinho fica numa barra fixa em baixo e o utilizador precisa de ver claramente de quem é o obituário.

**Desktop (`lg+`)**
- Esconde o card grande do topo.
- Na coluna direita (sidebar 400px), antes do card "O seu pedido", aparece um mini-card compacto com:
  - Foto pequena (ex.: 48×56px, cantos arredondados)
  - Nome do falecido (texto mais pequeno, `text-base` font-archivo semibold)
  - Anos (`1938 - 2026`) em `text-xs text-muted-foreground`
  - Localidade opcional, uma linha só, com ícone pequeno
- O conjunto fica `sticky top-4` junto com o carrinho, para acompanhar o scroll.
- O espaço libertado em cima permite que o catálogo comece mais alto e mostre mais produtos sem scroll.

## Onde mexer

Apenas em `src/pages/ObituaryFlowers.tsx`:
1. Envolver o `<Card>` atual do resumo (linhas 237-259) numa div com `className="lg:hidden"`.
2. Adicionar um novo mini-card dentro do `<aside className="hidden lg:block">` (linha 295), acima do card "O seu pedido", também `sticky top-4` (ou agrupar ambos num contentor sticky com `space-y-4`).
3. Aplica-se apenas ao `step === "catalog"`. No step de checkout o layout não muda.

Sem alterações de dados, queries ou lógica — só apresentação.
