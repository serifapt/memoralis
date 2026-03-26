

## Plano: Atualizar thumbnail do template Profissional

### Problema
O thumbnail do template "Profissional" mostra blocos genéricos cinza em vez de uma miniatura fiel ao design real do template A4.

### Solução
Substituir o conteúdo do `renderContent()` para `type === "profissional"` por uma miniatura que replica a estrutura do template A4 real em escala reduzida:

**`src/components/obituaries/TemplateThumbnail.tsx`** — Redesenhar o bloco `profissional`:
- Foto retangular com cantos arredondados no canto superior esquerdo (grayscale placeholder)
- Texto do nome (barra escura) e idade (barra mais clara) à direita da foto
- Localidade abaixo
- "FALECEU EM" texto à esquerda
- Secções de eventos (Velório, Funeral, Cemitério) representadas por linhas à direita
- Texto de condolências + QR code placeholder em baixo à esquerda
- Logo funerária em baixo à direita
- Logo memoralis no canto superior direito

Layout usa posicionamento relativo com flexbox e blocos de cor para simular o template real em miniatura, mantendo as proporções 3:4 do aspect-ratio existente.

### Ficheiro editado
1. `src/components/obituaries/TemplateThumbnail.tsx`

