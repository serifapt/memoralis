

## Adicionar botão "Guardar" após "Adicionar Secção"

### O que muda

No ficheiro `src/pages/BudgetQuoteDetail.tsx`, logo após o botão "Adicionar Secção" (linha 714), adicionar um botão "Guardar" que:

1. Chama a mesma função `handleSave` já existente
2. Após guardar com sucesso, faz scroll automático até ao topo da página (`window.scrollTo({ top: 0, behavior: 'smooth' })`)
3. Visualmente: botão com ícone `Save`, variante `default` (primário), largura total (`w-full`), para se destacar do botão "Adicionar Secção" que é `outline`
4. Desabilitado quando `saving` ou `isArchived` (mesma lógica do botão de topo)
5. Escondido quando `isArchived` (mesmo wrapper do botão "Adicionar Secção")

### Implementação

- Modificar `handleSave` para fazer scroll ao topo após sucesso (ou criar wrapper `handleSaveAndScroll` que chama `handleSave` e depois faz scroll)
- Inserir o novo botão entre a linha 714 e 715, dentro do bloco `!isArchived`

### Ficheiro a alterar
- `src/pages/BudgetQuoteDetail.tsx`

