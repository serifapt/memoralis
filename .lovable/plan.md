

## Plano: Melhorar labels com tooltip e espaçar botões de ação

### Alterações

**Ficheiro: `src/pages/NewObituary.tsx`**

1. **Substituir labels descritivas por label curta + ícone info com tooltip**:
   - `NIF* (necessário para documentos fiscais)` → `NIF*` + ícone `Info` com tooltip "Necessário para documentos fiscais"
   - `Segurança Social* (necessário para subsídio funeral)` → `Segurança Social*` + ícone `Info` com tooltip "Necessário para subsídio funeral"
   - `Nome do Cemitério* (necessário para documentos oficiais)` → `Nome do Cemitério*` + ícone `Info` com tooltip "Necessário para documentos oficiais"
   - Verificar se existem outros campos com o mesmo padrão e aplicar a mesma lógica.

2. **Adicionar espaçamento entre os botões "Criar Orçamento" e "Ver Perfil Público"**:
   - Actualmente ambos estão dentro de `space-y-3` mas o botão "Ver Perfil" está dentro de um `<Link>` que pode não receber o espaçamento correctamente. Garantir `gap` consistente entre os dois botões.

### Detalhes técnicos
- Usar `lucide-react` `Info` icon (tamanho `w-3.5 h-3.5`)
- Usar os componentes `Tooltip`/`TooltipProvider` já importados
- Layout da label: `flex items-center gap-1.5` com o texto e o ícone inline

