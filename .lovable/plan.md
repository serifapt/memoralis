

## Melhorias no Gerador de Anúncios

### 1. Mensagem da família vem do campo `publicMessage`
A lógica actual já usa `obituaryData.publicMessage` — que corresponde ao campo "Mensagem Pública / Mensagem da família". Confirmar que a prop `familyText` no `ObituaryTemplateA4` recebe esse valor correctamente (já acontece na linha 113 do AnnouncementGenerator). Sem alteração necessária aqui.

### 2. Foto com máscara sem deformar
**`ObituaryTemplateA4.tsx`** — A foto já usa `object-fit: cover` e `object-position: center top`, o que não deforma. O problema visível na screenshot é que a área da foto (173x208px) pode estar a encolher a imagem. Vou garantir que o container mantém as dimensões fixas e a imagem preenche via `cover` sem deformação. Se necessário, ajustar o container para usar `min-width`/`min-height` para evitar colapso.

### 3. Logo Memoralis a preto com 30% opacidade
**`ObituaryTemplateA4.tsx`** — Adicionar `style={{ opacity: 0.3 }}` ao container do `LogoMemoralis` e alterar as cores do SVG em `ObituaryIcons.tsx` de `#d85151` (vermelho) e `#2d595e` (verde) para `#000000` (preto) nas paths do `LogoMemoralis`.

### 4. QR Code gerado automaticamente
- Instalar a biblioteca `qrcode.react` para gerar QR codes em React
- Adicionar `obituaryId` ao interface `AnnouncementGeneratorProps` e passá-lo do `NewObituary.tsx`
- No `AnnouncementGenerator`, gerar o URL público (`https://memoralis.lovable.app/obituario/{id}`) e renderizar o QR code via `<QRCodeCanvas>` convertido para data URL
- Passar o data URL como prop `qrCodeImage` ao `ObituaryTemplateA4`

### Ficheiros a editar
- `src/components/obituaries/ObituaryIcons.tsx` — cores do LogoMemoralis para preto
- `src/components/obituaries/ObituaryTemplateA4.tsx` — opacidade 30% no logo, verificar foto
- `src/components/obituaries/AnnouncementGenerator.tsx` — adicionar `obituaryId` à interface, gerar QR code
- `src/pages/NewObituary.tsx` — passar `obituaryId={id}` ao AnnouncementGenerator
- Instalar: `qrcode.react`

