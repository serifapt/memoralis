
Objetivo: fazer com que os cards de obituário da página inicial usem exatamente o mesmo visual e os mesmos dados do Arquivo de Obituários.

Plano

1. Unificar o layout do card público
- Extrair o card que já está correto em `src/pages/ObituaryArchive.tsx` para um componente reutilizável, por exemplo `src/components/obituaries/PublicObituaryCard.tsx`.
- Esse componente passa a ser a fonte única do layout dos cards públicos, evitando diferenças entre Home e Arquivo.

2. Levar para a Home os mesmos dados do Arquivo
- Atualizar a query da Home em `src/pages/Home.tsx` para incluir também `freguesia` e manter a funerária associada.
- Alinhar a interface `PublicObituary` da Home com a do Arquivo, para suportar:
  - nome
  - foto
  - datas
  - idade
  - `freguesia + locality`
  - funerária com link público

3. Replicar exatamente a apresentação do Arquivo
- Na Home, usar o mesmo componente do Arquivo para mostrar:
  - nome em destaque
  - anos de nascimento e falecimento
  - idade
  - localização no formato `Freguesia - Localidade`
  - funerária com ícone e link para a página pública
  - botões “Condolências” e “Enviar Flores”
- Manter o `stopPropagation()` no link da funerária para não quebrar o clique principal do card.

4. Preservar comportamento e consistência
- Manter a navegação do card para o detalhe do obituário.
- Garantir que, se faltar `freguesia`, `locality` ou funerária, o card continua estável sem quebrar o layout.
- Validar que Home e Arquivo ficam visualmente iguais para o mesmo obituário.

Detalhes técnicos
- Ficheiros principais:
  - `src/pages/Home.tsx`
  - `src/pages/ObituaryArchive.tsx`
  - novo componente partilhado em `src/components/obituaries/`
- Não são necessárias alterações na base de dados.
- A abordagem mais segura é reutilizar o mesmo componente em vez de duplicar markup, porque elimina divergências futuras entre as duas páginas.
