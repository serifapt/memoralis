

## Plano: Trocar ordem Nome/Nome Completo e adicionar tooltip

### Alteração em `src/pages/NewObituary.tsx` (linhas 980-1018)

1. **Trocar ordem**: "Nome Completo" passa a ser o primeiro campo, "Nome" passa a ser o segundo
2. **Tooltip no "Nome"**: Adicionar tooltip com texto "Nome para o perfil público" usando os componentes `Tooltip`, `TooltipTrigger`, `TooltipContent` já existentes, com um ícone `Info` do lucide-react

Resultado visual:
- Campo 1: "Nome Completo*" (input full-width)
- Campo 2: "Nome*" com ícone (i) e tooltip "Nome para o perfil público" (input full-width)

