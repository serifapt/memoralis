

## Plano: Melhorar alinhamento e hover dos ícones na sidebar colapsada

### Problema
Na screenshot, os ícones quando a sidebar está colapsada não estão bem centrados e o hover não tem o mesmo comportamento visual dos botões expandidos.

### Alterações em `src/components/layout/Sidebar.tsx`

1. **Centrar ícones no modo colapsado**: No header, centrar o botão de toggle quando colapsado. Ajustar padding do container do logo para centrar.

2. **Uniformizar hover**: Os nav items colapsados já têm `hover:bg-[hsl(var(--sidebar-hover))]`, mas o padding (`px-2`) e a falta de tamanho fixo fazem com que a área de hover seja inconsistente. Adicionar tamanho fixo (`w-12 h-12` ou `p-3`) quando colapsado para criar áreas de hover quadradas e uniformes, centradas na sidebar.

3. **Ajustes específicos**:
   - Nav items colapsados: `justify-center px-0 py-0 w-12 h-12 mx-auto` para área de clique quadrada e centrada
   - Botão de logout colapsado: mesmo tratamento
   - Header colapsado: centrar o botão de toggle com `justify-center`

