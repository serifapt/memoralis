

## Correções no Anúncio A4

### 1. Mensagem da família aparece sem dados
**Problema**: `familyText` tem valor default `DEFAULT_FAMILY_TEXT` na prop (linha 62 do template). Quando o `AnnouncementGenerator` passa `undefined` (sem mensagem pública), o default é usado.

**Solução**: No `ObituaryTemplateA4.tsx`, remover o default da prop `familyText` e só renderizar a secção se `familyText` tiver conteúdo. Alterar `familyText = DEFAULT_FAMILY_TEXT` para `familyText` sem default, e envolver o bloco da família num condicional `{familyText && ...}`.

### 2. Texto não alinhado com os ícones
**Problema**: Os ícones SVG têm tamanhos diferentes (14px vs 16px) e não têm `flexShrink: 0` nem `minWidth`, causando desalinhamento visual.

**Solução**: No `EventSection`, adicionar `style={{ flexShrink: 0, width: 14, height: 14 }}` a cada wrapper de ícone e garantir que o `IconMapPin` usa `width="14" height="14"` em vez de 16px. Adicionar `alignItems: "flex-start"` em vez de `"center"` e `paddingTop: 2` no ícone para alinhar com a primeira linha de texto.

### 3. Foto sai a cores no PDF
**Problema**: `html2canvas` não suporta correctamente o filtro CSS `filter: grayscale(100%)`. A foto aparece a preto e branco no browser mas a cores no PDF exportado.

**Solução**: Aplicar o grayscale via canvas antes de passar ao template. No `AnnouncementGenerator.tsx`, criar uma função que carrega a imagem num canvas offscreen, aplica grayscale manualmente (manipulação de pixels), e devolve um data URL em grayscale. Usar este data URL processado como prop `photo` em vez do URL original.

### Ficheiros a editar
- `src/components/obituaries/ObituaryTemplateA4.tsx` — remover default do `familyText`, condicionar renderização
- `src/components/obituaries/ObituaryTemplateA4.tsx` — alinhar ícones com texto no `EventSection`
- `src/components/obituaries/ObituaryIcons.tsx` — uniformizar tamanho do `IconMapPin` para 14px
- `src/components/obituaries/AnnouncementGenerator.tsx` — converter foto para grayscale via canvas antes de renderizar

