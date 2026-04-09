

## Alinhar card de pré-visualização com o PublicObituaryCard

### Problema
O card de pré-visualização no editor de obituários (`NewObituary.tsx`, linhas 2913-2985) tem um design diferente do `PublicObituaryCard` usado no frontend público: ícones diferentes (Heart vs Flame, MessageCircle vs MessageSquare), layout ligeiramente diferente, valores hardcoded, e falta o ícone MapPin/Building2.

### Solução
Reescrever o bloco de pré-visualização em `NewObituary.tsx` (linhas 2913-2985) para replicar exatamente a estrutura e estilos do `PublicObituaryCard`:

1. **Imagem**: manter o `aspect-[3/4]` com a foto ou placeholder (Camera icon)
2. **Tag/Badge**: usar `Badge` com `active_tag` dinâmico baseado nos eventos de cerimónia do formulário (em vez de "Funeral" hardcoded)
3. **Nome + Datas**: manter a lógica atual de formData mas com a mesma estrutura HTML
4. **Localização**: usar ícone `MapPin` (Lucide) em vez de emoji 📍
5. **Funerária**: usar ícone `Building2` com o nome real da funerária do utilizador
6. **Botões**: usar a mesma estrutura de 2 botões flex com as classes `h-7 sm:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs`
7. **Contadores**: usar os ícones corretos — `Eye`, `MessageSquare`, `Flame` — com as mesmas classes `w-3.5 h-3.5`

### Ficheiro a alterar
- `src/pages/NewObituary.tsx` — reescrever linhas ~2913-2985 para espelhar o `PublicObituaryCard`

