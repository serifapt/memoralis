

## Plano: Selector manual de estado do orçamento

### Situação actual
O estado só pode ser alterado de forma linear (DRAFT → SENT → ACCEPTED) através de botões condicionais. O utilizador quer poder mudar para qualquer estado manualmente.

### Solução
Tornar o Badge de estado clicável, transformando-o num dropdown (usando `DropdownMenu`) que mostra todas as opções de estado disponíveis. Ao seleccionar um estado diferente, chama `handleStatusChange`.

### Alteração em `src/pages/BudgetQuoteDetail.tsx`

1. Importar `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` e o ícone `ChevronDown`
2. Substituir o Badge estático (linhas 438-442) por um `DropdownMenu` com o Badge como trigger, mostrando os 4 estados como opções
3. Manter os botões de acção rápida existentes (Marcar Enviado, Marcar Aceite) como estão, para conveniência — ou removê-los para simplificar a UI, já que o dropdown cobre a mesma funcionalidade

### Resultado
O utilizador clica no badge de estado → aparece um menu com Rascunho, Enviado, Aceite, Arquivado → selecciona → estado muda imediatamente.

### Ficheiro a alterar
- `src/pages/BudgetQuoteDetail.tsx`

