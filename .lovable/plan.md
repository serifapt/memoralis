

## Cards de funerárias na Home com layout horizontal (como referência)

O utilizador quer que os cards na secção "Funerárias" da Home usem um layout horizontal (logo à esquerda, info à direita, botão "Ver página") em vez do layout vertical do `PublicFunerariaCard`. Os dados reais já estão a ser carregados — só o layout do card na Home precisa de mudar.

### Alterações

#### 1. `src/pages/Home.tsx` — Secção Funerárias (linhas 309-318)

Substituir o uso de `PublicFunerariaCard` por um card horizontal inline com:
- **Esquerda**: imagem quadrada (logo/cover) com cantos arredondados, ~120px
- **Direita**: nome comercial, estrela + rating + (count) se houver avaliações, localidade com ícone MapPin
- **Rodapé**: botão "Ver página" outline
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` para layout responsivo

Layout de referência:
```text
┌─────────────────────────────────────┐
│ ┌──────────┐  Nome Comercial        │
│ │          │  ★ 3.9 (18)           │
│ │  logo    │  📍 Localidade        │
│ │          │                        │
│ └──────────┘  [Ver página]          │
└─────────────────────────────────────┘
```

### Ficheiro editado
1. `src/pages/Home.tsx`

