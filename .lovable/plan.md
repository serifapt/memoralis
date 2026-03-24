

## Plano: Fixar proporção 1:1 no LogoCropper

### Contexto
O logo é usado principalmente em avatares e cards (onde 1:1 é ideal). Nos cabeçalhos PDF e página pública, o logo é renderizado com `object-contain`, pelo que 1:1 funciona bem em todos os contextos.

### Alterações em `src/components/settings/LogoCropper.tsx`

1. **Remover os botões de seleção de proporção** — eliminar `ASPECT_OPTIONS`, o state `selectedAspect`, e a função `handleAspectChange`
2. **Fixar `aspect={1}` no `ReactCrop`** — sempre quadrado
3. **Inicializar o crop centrado** com proporção 1:1 ao abrir o dialog (usar `onImageLoad` para calcular o crop inicial centrado)
4. **Simplificar o UI** — remover a barra de botões de proporção, manter apenas a área de recorte e os botões Cancelar/Confirmar

