
## Plano: corrigir de vez o alinhamento da sidebar colapsada

### Diagnóstico
O problema já não é só de `padding`: no estado colapsado, header, navegação e footer estão a centrar os elementos de formas diferentes. Isso faz com que:
- o botão de colapsar/expandir fique numa coluna visual
- os itens do menu noutra
- o botão de sair noutra

Além disso, o hover/ativo dos itens colapsados deve usar exactamente a mesma “caixa” visual em todos os botões.

### Alterações em `src/components/layout/Sidebar.tsx`

#### 1. Unificar a geometria dos botões colapsados
Criar uma classe/base comum para:
- botão de colapsar/expandir
- itens da navegação
- botão de sair

Essa base deve usar sempre:
- `w-10 h-10`
- `flex items-center justify-center`
- `rounded-lg`
- `p-0`

Assim todos passam a ocupar a mesma caixa e ficam alinhados na mesma coluna.

#### 2. Corrigir o alinhamento estrutural da coluna
No estado colapsado:
- o `header` continua com `p-2 justify-center`
- a `nav` passa a usar layout centrado (`flex flex-col items-center`)
- o `footer` também centra o botão usando a mesma lógica da nav

Isto elimina a dependência de `mx-auto` espalhado pelos elementos e garante que toggle, ícones e logout ficam todos sobre o mesmo eixo vertical.

#### 3. Uniformizar hover e estado ativo
Nos itens colapsados:
- usar `hover:bg-primary hover:text-primary-foreground`
- manter `bg-primary text-primary-foreground` no item activo
- aplicar o mesmo comportamento visual ao botão de sair e ao botão de colapsar

Assim o hover vermelho fica consistente com o comportamento antigo dos botões.

#### 4. Simplificar o `NavItem`
Ajustar o `NavItem` para que, quando colapsado:
- não dependa de margens automáticas para alinhamento
- use a mesma classe-base dos restantes botões
- mantenha os tooltips como estão

### Resultado esperado
No modo reduzido:
- ícone do topo, ícones do menu e ícone de sair ficam perfeitamente centrados entre si
- o fundo vermelho no hover aparece centrado e com o mesmo tamanho em todos os botões
- o item activo deixa de parecer deslocado

### Detalhes técnicos
- Ficheiro a alterar: `src/components/layout/Sidebar.tsx`
- Sem alterações de backend
- Sem alterações a outras páginas
