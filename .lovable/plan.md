

## Plano: Alinhar ícones e corrigir hover na sidebar colapsada

### Problemas
1. **Desalinhamento**: O botão de toggle tem `w-10 h-10` com padding do container `p-2`, mas o alinhamento horizontal pode diferir por causa de como o `mx-auto` interage com o `p-2` da nav
2. **Hover sem fundo vermelho**: No estado expandido, o item ativo tem `bg-primary` (vermelho). Mas no hover dos itens colapsados usa-se `--sidebar-hover` (bege neutro) — deveria manter o mesmo estilo de hover com fundo vermelho/primary que os botões expandidos tinham

### Alterações em `src/components/layout/Sidebar.tsx`

1. **Alinhar ícones com o toggle**: Remover `mx-auto` dos nav items colapsados e usar `flex justify-center` no container `nav` (com `items-center flex-col`). Alternativa mais simples: manter `mx-auto` mas garantir que o toggle também usa exactamente `w-10 h-10 mx-auto` com o mesmo padding envolvente

2. **Hover com fundo vermelho**: Substituir `hover:bg-[hsl(var(--sidebar-hover))]` por `hover:bg-primary hover:text-primary-foreground` nos nav items colapsados (e no logout), para que o hover tenha o mesmo visual vermelho do estado expandido

3. **Uniformizar o toggle**: O botão de toggle no header deve ter exactamente as mesmas dimensões e alinhamento que os nav items (`w-10 h-10 mx-auto flex items-center justify-center`)

