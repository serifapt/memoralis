

## Plano: Centrar ícones alinhados com o botão de colapsar

### Problema
O botão de toggle no header tem `p-4` no container, enquanto os nav items têm `p-2` no container da nav. Isto causa desalinhamento horizontal entre o ícone de colapsar e os ícones de navegação.

### Alterações em `src/components/layout/Sidebar.tsx`

1. **Header colapsado**: Reduzir o padding do container do header para `p-2` quando colapsado, igualando o padding da nav
2. **Uniformizar tamanhos**: Manter todos os ícones (toggle, nav items, logout) com `w-10 h-10 mx-auto` quando colapsado para alinhamento perfeito na mesma coluna central

