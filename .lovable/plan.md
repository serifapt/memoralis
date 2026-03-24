

## Plano: Auto-otimizar logos horizontais para 1:1

### Ideia
Quando o utilizador faz upload de uma imagem horizontal (largura > altura), em vez de abrir o cropper manualmente, a imagem é automaticamente recortada para 1:1 (centrada) e aplicada diretamente. O cropper só abre se a imagem já for quadrada ou vertical (onde o utilizador pode querer ajustar manualmente o enquadramento).

### Alterações

#### 1. `src/pages/Settings.tsx` — `handleLogoFileChange`
- Após carregar a imagem no `FileReader`, criar um `Image()` para obter `naturalWidth` e `naturalHeight`
- Se `naturalWidth > naturalHeight` (horizontal): recortar automaticamente via Canvas para 1:1 (centrado na imagem), gerar o blob e aplicar directamente sem abrir o cropper
- Caso contrário: abrir o cropper como actualmente

#### 2. Nova função utilitária `autoCropToSquare` (inline em Settings.tsx ou num util)
- Recebe o `src` da imagem (data URL)
- Carrega num `Image`, calcula o offset para centrar um quadrado de lado `Math.min(w, h)`
- Desenha no Canvas e retorna um `Blob` via `canvas.toBlob()`
- Chama `handleCropComplete` com o resultado

### Resultado
Logos horizontais são automaticamente convertidos para 1:1 sem interação extra. O utilizador pode sempre re-recortar manualmente clicando "Recortar".

