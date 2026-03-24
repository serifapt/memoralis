

## Plano: Sidebar colapsável com modo ícones

### Alterações

#### 1. `src/components/layout/Sidebar.tsx`
- Adicionar state `collapsed` (boolean) com `useState`, persistido em `localStorage`
- Botão de toggle (ícone `PanelLeftClose`/`PanelLeftOpen`) no fundo do header ou no topo
- Quando colapsado:
  - Largura muda de `w-64` para `w-16`
  - Logo esconde, mostra apenas o ícone/avatar pequeno
  - Texto dos links (`span`) esconde, ficam só os ícones centrados
  - Subtítulo "Gestão Funerária" esconde
  - Botão "Sair" mostra apenas o ícone
  - Tooltips nos ícones com o nome do item (usando `Tooltip` do shadcn)
- Transição suave com `transition-all duration-300`

#### 2. `src/components/layout/AppLayout.tsx`
- Nenhuma alteração necessária — o `flex-1` no main já se adapta automaticamente à largura da sidebar

### Detalhes técnicos
- Persistência do estado em `localStorage` para manter a preferência entre sessões
- Tooltips via `<Tooltip>` do shadcn para mostrar o nome ao passar o rato nos ícones quando colapsado
- O botão de toggle fica na parte inferior do header (junto ao logo) ou como último item antes do footer

