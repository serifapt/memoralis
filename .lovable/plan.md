

## Plano: Corrigir "Obituário não encontrado" na página pública

### Causa raiz

O obituário `Libertina Lourenço` tem `is_completed = false`. A política RLS "Public can view published obituaries" exige `is_public = true AND is_completed = true`, por isso a query na página pública retorna `null`.

Mesmo que o utilizador esteja autenticado como dono da funerária, ao abrir num novo tab (preview do Lovable), a sessão pode não ser partilhada, fazendo com que apenas a política pública se aplique.

### Correções

| Ficheiro | Ação |
|---|---|
| `src/pages/NewObituary.tsx` | Botão "Ver Perfil Público": desativado com aviso quando `is_completed = false`; só abre link quando obituário está publicado |
| `src/pages/ObituaryDetail.tsx` | Quando o obituário não é encontrado via RLS, verificar se o utilizador está autenticado e é o dono — se sim, mostrar mensagem "Este obituário ainda não está publicado" em vez de "não encontrado" |

### Detalhes técnicos

**NewObituary.tsx** — Botão condicional:
- Se `is_completed && is_public`: Link normal para `/obituario/${id}` com `target="_blank"`
- Se não: Botão desativado com tooltip "Publique o obituário primeiro para ver o perfil público"

**ObituaryDetail.tsx** — Fallback inteligente:
- Quando `obit` é `null`, fazer uma segunda query autenticada (sem filtros RLS, usando a política do dono) para verificar se o obituário existe mas não está publicado
- Se existir mas `is_completed = false`: mostrar mensagem "Este obituário ainda não foi publicado. Complete e publique-o no dashboard para o tornar visível."
- Se não existir de todo: manter a mensagem atual "Obituário não encontrado"

