

## Plano: Ocultar condolências apenas por obituário (via toggle existente)

### Estado atual
O campo `hide_condolences` já existe na BD e no formulário de edição do obituário. No `ObituaryDetail.tsx`, o botão e a secção de condolências já estão condicionados com `{!obituary.hide_condolences && ...}` (linhas 322 e 383).

A funcionalidade já está implementada correctamente — o toggle no editor do obituário controla a visibilidade por obituário individual.

### Alteração necessária

#### `src/components/obituaries/PublicObituaryCard.tsx`
- O botão "Condolências" nos cards públicos não tem acesso ao campo `hide_condolences`, por isso aparece sempre
- Duas opções:
  1. **Remover o botão dos cards** (recomendado) — nos cards da listagem, o botão "Condolências" faz pouco sentido porque redireciona para a página de detalhe; o utilizador pode aceder às condolências a partir daí
  2. Adicionar `hide_condolences` à interface `PublicObituary` e à query que alimenta os cards, e condicionar o botão

**Recomendação**: Remover o botão "Condolências" dos cards públicos e manter apenas o botão na página de detalhe (onde já respeita o toggle). Substituir por um botão "Ver mais" ou simplesmente deixar só o botão "Enviar Flores".

