

## Plano: Aumentar logo e estilizar contactos no card da funerária (ObituaryDetail)

### Alterações em `src/pages/ObituaryDetail.tsx` (linhas 350-396)

1. **Aumentar logo**: Mudar `w-32 h-32` para `w-48 h-48` no logo e no fallback de iniciais

2. **Contactos em cinza sem sublinhado**: Seguir o padrão da página da funerária (`FunerariaDetail.tsx` linhas 187-203):
   - Telefone e email: mudar de `text-primary hover:underline` para `text-muted-foreground hover:text-primary transition-colors` e adicionar ícones (`Phone`, `Mail`)
   - Morada: mesmo estilo `text-muted-foreground hover:text-primary transition-colors` com ícone `MapPin`
   - Layout horizontal inline com ícones, semelhante à página pública da funerária
   - Remover `hover:underline` de todos os links

