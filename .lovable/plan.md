## Objetivo

No `/obituario` (e equivalente em `/funerarias` se aplicável), no **mobile** os 4 selects (Localidade, Freguesia, Distrito, Funerária) ficam escondidos atrás de um botão de filtros, e as **tag pills** (Todos, Funeral, Missa 7º dia, etc.) passam a ser uma fila com scroll horizontal por swipe. No desktop nada muda.

## Alterações em `src/pages/ObituaryArchive.tsx`

1. **Barra superior mobile** (`md:hidden`)
   - Input de pesquisa por nome ocupa toda a largura
   - Ao lado, botão de ícone `SlidersHorizontal` com badge a mostrar o nº de filtros ativos (contagem dos selects diferentes de `"all"`)
   - Esconder a grid de selects atual no mobile (`hidden md:grid`)

2. **Drawer de filtros** (componente `Sheet` do shadcn, lado `bottom`, altura ~85vh)
   - Título "Filtros"
   - Corpo com os 4 selects empilhados (Localidade, Freguesia, Distrito, Funerária) — mesmos componentes/estado já existentes
   - Rodapé com dois botões: "Limpar" (repõe os 4 selects + textos a `"all"`/`""`) e "Ver resultados" (`SheetClose`)
   - Reutilizar os mesmos selects no desktop para não duplicar lógica

3. **Tag pills com swipe no mobile**
   - Container muda de `flex flex-wrap` para `flex overflow-x-auto scrollbar-hide` no mobile e mantém `sm:flex-wrap sm:overflow-visible` no desktop
   - Cada pill ganha `shrink-0` para não comprimir
   - Margens negativas laterais (`-mx-4 px-4 sm:mx-0 sm:px-0`) para o scroll alinhar com o conteúdo

## Detalhes técnicos

- Componentes novos importados: `Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose` de `@/components/ui/sheet`, `Badge` de `@/components/ui/badge`, ícone `SlidersHorizontal` do `lucide-react`.
- Sem alterações à lógica de query/Supabase — só reorganização visual.
- `scrollbar-hide`: se o utilitário não existir no Tailwind, uso `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]` inline.
- Verifico no preview mobile (375px) que (a) o drawer abre, fecha e aplica filtros, (b) o badge mostra o nº correto, (c) o "Limpar" repõe, (d) as pills fazem scroll horizontal suave e a pill ativa mantém o estilo `bg-primary text-primary-foreground`.

## Fora do âmbito

- Não mexo no `FunerariaArchive` nesta tarefa (posso replicar depois se quiseres).
- Não toco no sort ("Mais recentes") nem na grelha de resultados.
