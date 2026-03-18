
Diagnóstico

Eu consegui perceber a causa principal, e são na verdade 2 problemas diferentes:

1. A página `/funerarias` ainda não usa dados reais
- `src/pages/FunerariaArchive.tsx` está completamente mock.
- O ficheiro cria `mockFuneralHomes` e força `image: "/placeholder.svg"`.
- Por isso, nada do que é guardado no dashboard pode aparecer nessa página neste momento.

2. O domínio publicado está a servir uma versão antiga da página pública
- Os dados no backend para `slug = 'sjoao'` já existem e incluem `logo_url` e `cover_image_url`.
- O código atual de `src/pages/FunerariaDetail.tsx` já lê `logo_url` e `cover_image_url` da tabela `funerarias`.
- Mas o conteúdo que está a aparecer em `memoralis.lovable.app/funerarias/sjoao` não bate certo nem com a base de dados nem com o código atual, o que indica que o site publicado ainda está numa versão anterior do frontend.

O que isto significa
- O problema não é o dashboard não guardar.
- O problema é:
  - na listagem de funerárias, o frontend ainda está mock;
  - na página pública publicada, estás a ver uma build antiga.

Plano

1. Ligar `/funerarias` a dados reais
- Substituir `mockFuneralHomes` por uma query real à tabela `funerarias`
- Filtrar apenas funerárias com `pagina_publica_visivel = true`
- Mostrar `cover_image_url` como imagem principal
- Fazer fallback para `logo_url` e depois `/placeholder.svg`
- Ligar o card ao `slug` em vez de IDs mock

2. Uniformizar a lógica de imagem entre listagem e detalhe
- Criar uma lógica única para escolher imagem:
  - `cover_image_url`
  - senão `logo_url`
  - senão placeholder
- Aplicar isto em:
  - `src/pages/FunerariaArchive.tsx`
  - `src/pages/FunerariaDetail.tsx`

3. Confirmar e alinhar preview vs publicado
- Validar primeiro no preview URL do projeto
- Depois publicar a versão atualizada para que `memoralis.lovable.app` passe a refletir o mesmo código
- Sem este passo, o domínio publicado pode continuar a mostrar a versão antiga mesmo com o código já correto no editor

4. Endurecer o rendering das imagens
- Adicionar fallback visual se uma imagem falhar ao carregar
- Garantir que a UI nunca fica com blocos “vazios” quando há URL inválida ou ficheiro apagado

Ficheiros a mexer
- `src/pages/FunerariaArchive.tsx` — remover mocks e ligar ao backend
- `src/pages/FunerariaDetail.tsx` — reforçar fallback/normalização de imagem
- Opcionalmente extrair helper partilhado para evitar duplicação da lógica de media

Detalhes técnicos
- Evidência no código:
  - `FunerariaArchive.tsx` usa dados hardcoded e `"/placeholder.svg"`
  - `FunerariaDetail.tsx` já está preparado para usar `logo_url` e `cover_image_url`
- Evidência no backend:
  - o registo `sjoao` já tem `logo_url` e `cover_image_url` preenchidos
- Conclusão:
  - dashboard -> backend: está a funcionar
  - backend -> página detalhe atual do código: está implementado
  - listagem pública: ainda não foi implementada
  - domínio publicado: está desfasado da versão atual
