

## Plano: Reformular fluxo de criação do orçamento e melhorar layout dos botões

### Problema actual
1. O utilizador tem de guardar o orçamento antes de ver/editar secções — fluxo pouco natural
2. A barra de botões de acção (Gerar PDF, Imprimir, Duplicar, etc.) está ao lado do título, ocupando espaço horizontal e ficando confusa

### Alterações

#### 1. Mostrar secções predefinidas imediatamente num novo orçamento (`BudgetQuoteDetail.tsx`)

- Quando `isNew`, inicializar o estado `sections` com as 4 secções predefinidas de `DEFAULT_SECTIONS` (com linhas locais, sem IDs de backend)
- As secções aparecem logo na página, editáveis, sem necessidade de guardar primeiro
- Remover a condição `!isNew` que esconde as secções (linha 529) e o botão "Adicionar Secção" (linha 653)
- Ao guardar (handleSave), criar o orçamento + todas as secções/linhas preenchidas de uma vez

#### 2. Auto-save progressivo (abordagem simplificada)

- Para orçamentos existentes, manter o comportamento actual (editar e guardar)
- Para novos, o botão "Guardar" persiste tudo de uma vez — o utilizador preenche campos e secções primeiro, guarda depois
- As secções locais (sem ID) usam IDs temporários (crypto.randomUUID) para permitir adicionar/editar/apagar linhas antes de persistir

#### 3. Mover barra de botões abaixo do título (`BudgetQuoteDetail.tsx`)

- Separar o header em duas linhas:
  - Linha 1: seta voltar + título + badge de estado + subtítulo
  - Linha 2: barra horizontal de botões de acção (Gerar PDF, Imprimir, Duplicar, Marcar Enviado, Arquivar, Guardar)
- Layout mais limpo, alinhado com o screenshot de referência

### Ficheiros a alterar
- `src/pages/BudgetQuoteDetail.tsx`

### Detalhes técnicos
- Secções locais (novo orçamento) terão `id` temporário com prefixo `temp-` para distinguir de IDs reais do backend
- `handleAddLine` e `handleUpdateLine` funcionarão sobre o estado local para secções temporárias
- No `handleSave`, se `isNew`, percorrer todas as secções/linhas locais e inserir no backend via `createQuote` (que já cria secções por defeito) — adaptar para usar as secções editadas pelo utilizador em vez do template fixo
- Passar as secções editadas ao `createQuote` ou criar uma variante que aceite secções customizadas

