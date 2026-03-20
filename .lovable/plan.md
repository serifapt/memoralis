

## Plano: Ligar botão "Ver Perfil Público" à página pública do obituário

### Problema
O botão "Ver Perfil Público" na linha 2037 do `NewObituary.tsx` é um `<Button>` sem `onClick` nem `Link` — não faz nada quando clicado.

### Correção
- Envolver o botão num `<Link to={/obituario/${id}}>` com `target="_blank"` para abrir numa nova tab
- Mostrar o botão apenas quando está em modo de edição (`isEditing && id`), já que um obituário novo ainda não tem página pública
- Adicionalmente, o obituário deve estar publicado (`is_public && is_completed`) para a página pública funcionar — caso contrário, mostrar um tooltip ou aviso

### Ficheiro a editar
| Ficheiro | Ação |
|---|---|
| `src/pages/NewObituary.tsx` | Converter botão em Link para `/obituario/${id}`, visível apenas em edição |

