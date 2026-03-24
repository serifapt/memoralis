

## Plano: Mover botão "Sair" para o fundo da sidebar

### Alteração em `src/components/layout/Sidebar.tsx`

Separar o botão "Sair" da `<nav>` e colocá-lo num bloco próprio no fundo da sidebar, com `mt-auto` para o empurrar para baixo.

**Estrutura:**
```
aside (flex flex-col)
├── header (logo)
├── nav (flex-1, navItems + toggle)
└── footer (mt-auto, border-top, botão Sair)
```

- Remover o bloco "Sair" de dentro da `<nav>`
- Adicionar um novo `<div>` após a `<nav>` com `border-t border-border py-2` e a mesma lógica de centrar/expandir
- O botão "Sair" usa exactamente as mesmas classes `COLLAPSED_BTN` / `EXPANDED_BTN`
- A `<nav>` deixa de precisar de `flex-1` (o `aside` com `flex flex-col` e o `mt-auto` no footer tratam do posicionamento)

