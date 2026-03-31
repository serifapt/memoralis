

## Correções no Template A4

### 1. Foto encolhida
O problema e que os wrappers `<span>` dos icones e da foto usam valores numericos sem unidade CSS. O `html2canvas` interpreta de forma inconsistente. Alterar `width: 173.333` para `width: "173px"` e `height: 208` para `height: "208px"` tanto no container como no `<img>`, garantindo unidades CSS explícitas em pixels.

### 2. Ícones desalinhados com texto
Os `<span>` que envolvem os ícones SVG não têm `display` definido — por defeito um `<span>` é `inline`, o que faz o SVG não respeitar `width`/`height`. Adicionar `display: "inline-flex"`, `alignItems: "center"`, `justifyContent: "center"` a cada wrapper de ícone no `EventSection`, com dimensões em string (`"14px"`).

### 3. Flores no canto inferior direito
- Copiar `user-uploads://flores-2.png` para `public/images/flores-obituario.png`
- No `AnnouncementGenerator.tsx`, passar `flowerImage="/images/flores-obituario.png"` ao `ObituaryTemplateA4`
- Ajustar o posicionamento das flores no template para ficar no canto inferior direito conforme o exemplo: `bottom: 0`, `right: 0`, sem rotação, com a imagem a ocupar ~250px de largura e a transbordar ligeiramente para fora do canto

### Ficheiros a editar
- `public/images/flores-obituario.png` — copiar asset
- `src/components/obituaries/ObituaryTemplateA4.tsx` — corrigir foto (unidades CSS), ícones (display inline-flex), reposicionar flores
- `src/components/obituaries/AnnouncementGenerator.tsx` — passar `flowerImage` ao template

