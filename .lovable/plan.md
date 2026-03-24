

## Plano: uniformizar a sidebar colapsada pelo padrão do botão de expandir

### Diagnóstico
No ficheiro `src/components/layout/Sidebar.tsx`, o botão de expandir já define a referência visual correcta, mas:
- os itens de navegação usam outra classe no modo colapsado
- o botão de sair usa a classe partilhada, mas está num container diferente
- header, nav e footer centram os elementos de formas diferentes

Resultado: cada botão fica com uma “caixa” e um alinhamento ligeiramente distintos.

### Alteração a fazer
Manter tudo igual ao botão de expandir no modo colapsado.

### Implementação em `src/components/layout/Sidebar.tsx`

#### 1. Criar uma única base visual para o modo colapsado
Usar uma única classe/base comum para:
- botão de expandir/colapsar
- todos os ícones do menu
- botão de sair

Essa base deve controlar sempre:
- largura e altura
- alinhamento interno
- border radius
- padding
- transição
- hover

Ou seja, os itens do menu deixam de ter uma versão “parecida” e passam a ter exactamente a mesma geometria do botão do topo.

#### 2. Aplicar a mesma estrutura aos 3 blocos
Uniformizar os wrappers do:
- header
- navegação
- footer

No estado colapsado, os 3 devem usar a mesma lógica de coluna centrada, sem variações de `mx-auto`, offsets ou espaçamentos diferentes.

#### 3. Ajustar o `NavItem`
Refatorar o `NavItem` para que, quando `collapsed`:
- reutilize a mesma base do botão de expandir
- mantenha apenas a diferença de estado activo
- não tenha classes próprias que alterem alinhamento ou hover

#### 4. Preservar estado activo sem mudar a caixa
O item activo deve continuar destacado, mas sem alterar:
- largura
- altura
- posicionamento
- área clicável

Assim o activo continua alinhado exactamente como os restantes.

### Resultado esperado
No modo reduzido:
- ícone de expandir/colapsar
- ícones do menu
- ícone de sair

ficam todos perfeitamente alinhados na mesma coluna e com comportamento visual uniforme.

### Ficheiro a alterar
- `src/components/layout/Sidebar.tsx`

