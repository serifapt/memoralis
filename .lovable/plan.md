

## Plano: Reorganizar sidebar — toggle após configurações + ícone do logo colapsado

### Alterações em `src/components/layout/Sidebar.tsx`

#### 1. Mover botão expandir/colapsar para o footer (após Configurações)
- Remover o botão de toggle do header
- Colocar o botão de expandir/colapsar no footer, entre "Configurações" e "Sair"
- Ordem no footer: **Configurações** → **Expandir/Colapsar** → **Sair**
- Para isso, remover "Configurações" do `bottomNavigation` na nav e passá-lo para o footer

#### 2. Uniformizar hover de todos os botões
- Os nav items expandidos usam `hover:bg-[hsl(var(--sidebar-hover))]` mas o botão "Sair" também
- Manter o hover consistente: todos os botões (nav items, toggle, sair) devem ter o mesmo comportamento de hover — usar `hover:bg-primary hover:text-primary-foreground` em todos, tanto colapsado como expandido

#### 3. Logo colapsado — mostrar ícone/favicon
- Quando colapsado, em vez de esconder o logo completamente, mostrar uma versão pequena (favicon ou o próprio `logo-memoralis.png` reduzido a ~32px)
- Usar `<img src={logo} className="w-8 h-8 object-contain" />` no header colapsado

#### 4. Estrutura final do footer
**Expandido:**
```
Configurações (link)
─────────────────
Expandir/Colapsar (botão)
Sair (botão)
```

**Colapsado:**
```
⚙️ (tooltip: Configurações)
◀️ (tooltip: Recolher)
🚪 (tooltip: Sair)
```

### Detalhes técnicos
- Remover `{ name: "Configurações", ... }` do array `bottomNavigation`
- No footer, renderizar: NavItem de Configurações + botão toggle + botão sair
- O botão de toggle expandido usa o mesmo estilo dos outros botões expandidos (com `hover:bg-primary`)
- Ficheiro: `src/components/layout/Sidebar.tsx`

