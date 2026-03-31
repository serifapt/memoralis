

## Plano: Preview embutido no card do template + remover preview em baixo

### O que muda

1. O card do template "Profissional" deixa de mostrar um wireframe estático e passa a renderizar uma versão miniatura do template real (ObituaryTemplateA4 ou SeventhDayMassTemplate), escalada para caber no thumbnail — mudando automaticamente consoante o `announcementType`.

2. O terceiro Card "Preview do Anúncio" (linhas 552-557) é removido do layout.

3. O template real continua a existir no DOM (escondido fora do viewport) para que `generatePDF()` e `generateImage()` possam capturá-lo via `document.getElementById("obituary-template-a4")`.

### Alterações

**`src/components/obituaries/TemplateThumbnail.tsx`**
- Aceitar nova prop opcional `previewContent?: React.ReactNode`
- Quando `previewContent` é fornecido e `type === "profissional"`, renderizar esse conteúdo escalado (via `transform: scale()` + `transform-origin: top left`) dentro do aspect-ratio container, em vez do wireframe actual
- O container usa `overflow-hidden` e dimensões fixas para enquadrar o A4 miniaturizado

**`src/components/obituaries/AnnouncementGenerator.tsx`**
- Construir o `previewContent` (o template real com dados) numa variável e passá-lo ao `TemplateThumbnail` do tipo "profissional"
- Mover o template real para um div offscreen (`position: absolute; left: -9999px`) com o `id="obituary-template-a4"` para manter a funcionalidade de exportação PDF/imagem
- Remover o Card "Preview do Anúncio" (linhas 552-557)

### Resultado

Ao trocar o tipo de anúncio, o card "Profissional" actualiza-se imediatamente com a miniatura do template correcto. Os outros dois templates (Elegante, Clássico) mantêm os wireframes actuais.

